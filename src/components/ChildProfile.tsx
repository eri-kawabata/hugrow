import React, { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { User, Save, Loader2, ArrowLeft, Calendar, Plus, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

type ChildProfile = {
  id: string;
  username: string | null;
  birthdate: string | null;
  child_number: number;
};

export function ChildProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newBirthdate, setNewBirthdate] = useState('');

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    if (!supabase) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('ログインが必要です');
        return;
      }

      // Get parent profile first
      const { data: parentProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', 'parent')
        .single();

      if (!parentProfile) {
        toast.error('保護者プロフィールが見つかりません');
        return;
      }

      // Get child profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, birthdate, child_number')
        .eq('parent_id', parentProfile.id)
        .eq('role', 'child')
        .order('child_number', { ascending: true });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('プロフィールの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (profile: ChildProfile, username: string, birthdate: string) => {
    if (!supabase) return;

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('ログインが必要です');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          username: username.trim() || null,
          birthdate: birthdate || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
        .eq('role', 'child');

      if (error) throw error;

      toast.success('プロフィールを更新しました');
      fetchProfiles();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('プロフィールの更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !newUsername.trim() || !newBirthdate) return;

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('ログインが必要です');
        return;
      }

      // Get parent profile
      const { data: parentProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', 'parent')
        .single();

      if (!parentProfile) {
        toast.error('保護者プロフィールが見つかりません');
        return;
      }

      // Get next child number
      const nextChildNumber = profiles.length + 1;

      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          username: newUsername.trim(),
          birthdate: newBirthdate,
          role: 'child',
          parent_id: parentProfile.id,
          child_number: nextChildNumber
        });

      if (error) throw error;

      toast.success('子供のプロフィールを追加しました');
      setNewUsername('');
      setNewBirthdate('');
      setShowAddForm(false);
      fetchProfiles();
    } catch (error) {
      console.error('Error adding profile:', error);
      toast.error('プロフィールの追加に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            to="/parent/profile"
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>プロフィール設定に戻る</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <User className="h-6 w-6 text-indigo-600" />
              子供のプロフィール設定
            </h1>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              <span>追加</span>
            </button>
          </div>

          <div className="space-y-8">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="p-6 rounded-xl border-2 border-gray-100"
              >
                <div className="mb-4">
                  <span className="text-sm font-medium text-indigo-600">
                    子供 {profile.child_number}
                  </span>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdate(
                      profile,
                      e.currentTarget.username.value,
                      e.currentTarget.birthdate.value
                    );
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor={`username-${profile.id}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      表示名
                    </label>
                    <input
                      id={`username-${profile.id}`}
                      name="username"
                      type="text"
                      defaultValue={profile.username || ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="表示名を入力"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`birthdate-${profile.id}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      誕生日
                    </label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <input
                        id={`birthdate-${profile.id}`}
                        name="birthdate"
                        type="date"
                        defaultValue={profile.birthdate || ''}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <Loader2 className="animate-spin h-5 w-5" />
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        <span>保存する</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>

        {/* Add Profile Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">子供のプロフィールを追加</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleAddProfile} className="space-y-4">
                <div>
                  <label htmlFor="newUsername" className="block text-sm font-medium text-gray-700 mb-1">
                    表示名
                  </label>
                  <input
                    id="newUsername"
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="表示名を入力"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="newBirthdate" className="block text-sm font-medium text-gray-700 mb-1">
                    誕生日
                  </label>
                  <input
                    id="newBirthdate"
                    type="date"
                    value={newBirthdate}
                    onChange={(e) => setNewBirthdate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !newUsername.trim() || !newBirthdate}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? (
                      <Loader2 className="animate-spin h-5 w-5" />
                    ) : (
                      <>
                        <Plus className="h-5 w-5" />
                        <span>追加する</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
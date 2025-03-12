import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './Layout';
import { User, Save, Loader2, ArrowLeft, Calendar, Plus, X, Trash2, Upload, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

type ChildProfile = {
  id: string;
  username: string | null;
  birthdate: string | null;
  child_number: number;
  avatar_url: string | null;
};

export function ChildProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newBirthdate, setNewBirthdate] = useState('');
  const [uploading, setUploading] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

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
        .select('id, username, birthdate, child_number, avatar_url')
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

      if (error) {
        console.error('Error adding profile:', error);
        
        // 一意性制約エラーの場合は、別のアプローチを試みる
        if (error.message.includes('unique constraint') || error.code === '23505') {
          // 新しいUUIDを生成
          const randomId = crypto.randomUUID();
          
          // 直接SQLを実行して挿入
          const { error: rpcError } = await supabase.rpc('insert_child_profile', {
            p_user_id: user.id,
            p_username: newUsername.trim(),
            p_birthdate: newBirthdate,
            p_parent_id: parentProfile.id,
            p_child_number: nextChildNumber,
            p_random_id: randomId
          });
          
          if (rpcError) {
            console.error('Error with direct SQL insert:', rpcError);
            toast.error('プロフィールの追加に失敗しました: ' + rpcError.message);
            return;
          }
          
          toast.success('子供のプロフィールを追加しました');
          setNewUsername('');
          setNewBirthdate('');
          setShowAddForm(false);
          fetchProfiles();
          return;
        }
        
        toast.error('プロフィールの追加に失敗しました: ' + error.message);
        return;
      }

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

  const handleDeleteProfile = async (profileId: string) => {
    if (!supabase) return;

    try {
      setSaving(true);
      
      // Delete profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId)
        .eq('role', 'child');

      if (error) throw error;

      // Update child numbers for remaining profiles
      const updatedProfiles = profiles.filter(p => p.id !== profileId);
      for (let i = 0; i < updatedProfiles.length; i++) {
        await supabase
          .from('profiles')
          .update({ child_number: i + 1 })
          .eq('id', updatedProfiles[i].id);
      }

      toast.success('プロフィールを削除しました');
      setShowDeleteConfirm(null);
      fetchProfiles();
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast.error('プロフィールの削除に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>, profileId: string) => {
    if (!event.target.files || !event.target.files.length || !supabase) {
      return;
    }

    try {
      setUploading(profileId);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${profileId}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profileId);

      if (updateError) throw updateError;

      toast.success('プロフィール画像をアップロードしました');
      fetchProfiles();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('画像のアップロードに失敗しました');
    } finally {
      setUploading(null);
      // Reset file input
      if (fileInputRefs.current[profileId]) {
        fileInputRefs.current[profileId]!.value = '';
      }
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
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            to="/parent/profile"
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
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

          {profiles.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">子供のプロフィールがありません</h3>
              <p className="text-gray-500 mb-6">「追加」ボタンをクリックして、子供のプロフィールを作成しましょう。</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                <span>プロフィールを追加</span>
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="p-6 rounded-xl border-2 border-gray-100 hover:border-indigo-100 transition-colors"
                >
                  <div className="mb-6 flex justify-between items-center">
                    <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                      子供 {profile.child_number}
                    </span>
                    <button
                      onClick={() => setShowDeleteConfirm(profile.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="プロフィールを削除"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative mb-4">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                          {profile.avatar_url ? (
                            <img 
                              src={profile.avatar_url} 
                              alt={profile.username || '子供のプロフィール'} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-16 w-16 text-gray-400" />
                          )}
                        </div>
                        <button
                          onClick={() => fileInputRefs.current[profile.id]?.click()}
                          className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors"
                          title="プロフィール画像をアップロード"
                          disabled={!!uploading}
                        >
                          {uploading === profile.id ? (
                            <Loader2 className="animate-spin h-5 w-5" />
                          ) : (
                            <Camera className="h-5 w-5" />
                          )}
                        </button>
                        <input
                          type="file"
                          ref={el => fileInputRefs.current[profile.id] = el}
                          onChange={(e) => handleAvatarUpload(e, profile.id)}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                      <p className="text-sm text-gray-500">プロフィール画像</p>
                    </div>
                    
                    <div className="md:col-span-2">
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Profile Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
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
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <input
                      id="newBirthdate"
                      type="date"
                      value={newBirthdate}
                      onChange={(e) => setNewBirthdate(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
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

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-red-600">プロフィールを削除</h2>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <p className="text-gray-700 mb-6">
                このプロフィールを削除すると、関連するすべてのデータが失われます。この操作は元に戻せません。
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => handleDeleteProfile(showDeleteConfirm)}
                  disabled={saving}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <>
                      <Trash2 className="h-5 w-5" />
                      <span>削除する</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
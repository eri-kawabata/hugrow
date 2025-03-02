import React, { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { User, Calendar, UserPlus, Edit, Save, Heart, BookOpen, Image } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { Profile } from '../lib/types';
import { Link } from 'react-router-dom';

export function ParentProfile() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [children, setChildren] = useState<Profile[]>([]);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);
      if (!user) return;

      // まず親のプロフィールを探す
      const { data: parentProfile, error: parentError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'parent')
        .maybeSingle();

      console.log('Parent profile:', parentProfile);

      if (parentProfile) {
        // 親のプロフィールが見つかった場合
        setProfile(parentProfile);
        return;
      }

      // 子供のプロフィールを探す
      const { data: childProfile, error: childError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'child')
        .maybeSingle();

      console.log('Child profile:', childProfile);

      if (childProfile) {
        // 子供のプロフィールを親に更新
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({
            role: 'parent',
            child_number: null,  // 親プロフィールなのでnullに設定
            parent_id: null,     // 親プロフィールなのでnullに設定
            updated_at: new Date().toISOString()
          })
          .eq('id', childProfile.id)
          .select()
          .single();

        if (updateError) {
          console.error('Failed to update profile to parent:', updateError);
          return;
        }

        console.log('Updated to parent profile:', updatedProfile);
        setProfile(updatedProfile);
        return;
      }

      // プロフィールが存在しない場合は新規作成
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: user.id,
            username: user.email?.split('@')[0] || '',
            email: user.email,
            role: 'parent',
            child_number: null,  // 親プロフィールなのでnull
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (createError) {
        console.error('Failed to create parent profile:', createError);
        return;
      }

      console.log('Created new parent profile:', newProfile);
      setProfile(newProfile);
    } catch (error) {
      console.error('Profile management error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildren = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, birthday, role')
        .eq('parent_id', profile.id)
        .eq('role', 'child')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Failed to fetch children:', error);
        return;
      }

      setChildren(data || []);
    } catch (error) {
      console.error('Failed to fetch children:', error);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchChildren();
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    if (!profile) return;
    
    try {
      setUpdating(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          birthday: profile.birthday,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;
      toast.success('プロフィールを更新しました');
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('プロフィールの更新に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-8 text-white shadow-lg mb-8">
          <h1 className="text-3xl font-bold mb-2">プロフィール</h1>
          <p className="text-indigo-100">基本情報の管理</p>
        </div>

        <div className="space-y-6">
          {/* 親の基本情報 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <User className="h-6 w-6 text-indigo-600" />
                あなたの情報
              </h2>
              <button
                onClick={() => setEditMode(!editMode)}
                className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <Edit className="h-4 w-4" />
                <span>{editMode ? '完了' : '編集'}</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  お名前（呼び名）
                </label>
                <input
                  type="text"
                  value={profile?.username || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, username: e.target.value } : null)}
                  disabled={!editMode}
                  className={`w-full px-4 py-3 border rounded-lg transition-colors
                    ${editMode ? 'border-indigo-300 focus:ring-2 focus:ring-indigo-500' : 'bg-gray-50 border-gray-200'}`}
                  placeholder="例：まなみ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  誕生日
                </label>
                <input
                  type="date"
                  value={profile?.birthday || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, birthday: e.target.value } : null)}
                  disabled={!editMode}
                  className={`w-full px-4 py-3 border rounded-lg transition-colors
                    ${editMode ? 'border-indigo-300 focus:ring-2 focus:ring-indigo-500' : 'bg-gray-50 border-gray-200'}`}
                />
              </div>
            </div>
            {editMode && (
              <button
                onClick={handleUpdateProfile}
                disabled={updating || !profile?.username}
                className="mt-6 w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 
                  focus:ring-4 focus:ring-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="h-5 w-5" />
                保存する
              </button>
            )}
          </div>

          {/* 子供のアカウント */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-indigo-600" />
              お子様の情報
            </h2>
            <div className="space-y-6">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-100 rounded-full">
                      <User className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium">{child.username || '名前未設定'}</p>
                      <p className="text-sm text-gray-500">
                        {child.birthday 
                          ? new Date(child.birthday).toLocaleDateString('ja-JP')
                          : '誕生日未設定'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Link
                      to={`/report?child=${child.id}`}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 
                        hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm"
                    >
                      <BookOpen className="h-4 w-4 text-indigo-600" />
                      <span>学習レポート</span>
                    </Link>
                    <Link
                      to={`/sel-analytics?child=${child.id}`}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 
                        hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm"
                    >
                      <Heart className="h-4 w-4 text-indigo-600" />
                      <span>感情分析</span>
                    </Link>
                    <Link
                      to={`/parent/works?child=${child.id}`}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 
                        hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm"
                    >
                      <Image className="h-4 w-4 text-indigo-600" />
                      <span>投稿一覧</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 設定リンク */}
          <div className="text-center">
            <Link
              to="/settings"
              className="text-indigo-600 hover:text-indigo-700 text-sm"
            >
              アカウント設定はこちら
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
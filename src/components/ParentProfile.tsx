import React, { useState, useEffect, useRef } from 'react';
import { User, Calendar, UserPlus, Edit, Save, Heart, BookOpen, Image, Upload, Plus, Trash2, Mail, Settings, X, Camera, Loader2 } from 'lucide-react';
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
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 子供の追加・編集用の状態
  const [showAddChildForm, setShowAddChildForm] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildBirthday, setNewChildBirthday] = useState('');
  const [childUploading, setChildUploading] = useState<string | null>(null);
  const [editingChild, setEditingChild] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const childFileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

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
        if (parentProfile.avatar_url) {
          // Base64形式の場合は直接表示
          if (parentProfile.avatar_url.startsWith('data:')) {
            setAvatarUrl(parentProfile.avatar_url);
          } else {
            // ストレージから取得
            downloadImage(parentProfile.avatar_url);
          }
        }
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
          .eq('user_id', user.id) // ユーザーIDを指定して権限を確認
          .select()
          .single();

        if (updateError) {
          console.error('Failed to update profile to parent:', updateError);
          return;
        }

        console.log('Updated to parent profile:', updatedProfile);
        setProfile(updatedProfile);
        if (updatedProfile.avatar_url) {
          // Base64形式の場合は直接表示
          if (updatedProfile.avatar_url.startsWith('data:')) {
            setAvatarUrl(updatedProfile.avatar_url);
          } else {
            // ストレージから取得
            downloadImage(updatedProfile.avatar_url);
          }
        }
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
      // 現在のユーザーを取得
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('ユーザー情報が取得できません');
        return;
      }

      console.log('Fetching children for parent ID:', profile.id);

      // データベースのスキーマを確認
      const { data: columns, error: columnsError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

      if (columnsError) {
        console.error('Failed to check database schema:', columnsError);
        return;
      }

      console.log('Database schema:', columns && columns.length > 0 ? Object.keys(columns[0]) : 'No columns found');

      // birthdateカラムが存在するか確認
      const hasBirthdateColumn = columns && columns.length > 0 && 'birthdate' in columns[0];
      const hasBirthdayColumn = columns && columns.length > 0 && 'birthday' in columns[0];

      console.log('Has birthdate column:', hasBirthdateColumn);
      console.log('Has birthday column:', hasBirthdayColumn);

      // 適切なカラムを選択
      let selectColumns = 'id, username, role, avatar_url, child_number';
      if (hasBirthdateColumn) {
        selectColumns += ', birthdate';
      } else if (hasBirthdayColumn) {
        selectColumns += ', birthday';
      }

      const { data, error } = await supabase
        .from('profiles')
        .select(selectColumns)
        .eq('parent_id', profile.id)
        .eq('role', 'child')
        .order('child_number', { ascending: true });

      if (error) {
        console.error('Failed to fetch children:', error);
        return;
      }

      console.log('Fetched children:', data);

      // birthdayカラムをbirthdateにマッピング
      const mappedData = data?.map(child => {
        const mappedChild: any = { ...child };
        if (hasBirthdayColumn && !hasBirthdateColumn && child.birthday) {
          mappedChild.birthdate = child.birthday;
        }
        return mappedChild;
      });

      setChildren(mappedData || []);
      
      // 子供のアバター画像をダウンロード
      for (const child of mappedData || []) {
        if (child.avatar_url) {
          // Base64形式の場合は直接表示
          if (child.avatar_url.startsWith('data:')) {
            setChildren(prev => 
              prev.map(c => 
                c.id === child.id 
                  ? { ...c, avatarUrl: child.avatar_url } 
                  : c
              )
            );
          } else {
            // ストレージから取得
            downloadChildImage(child.avatar_url, child.id);
          }
        }
      }
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

      // 現在のユーザーを取得
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('ユーザー情報が取得できません');
        setUpdating(false);
        return;
      }

      // データベースのスキーマを確認
      const { data: columns, error: columnsError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

      if (columnsError) {
        console.error('Failed to check database schema:', columnsError);
        toast.error('データベーススキーマの確認に失敗しました');
        setUpdating(false);
        return;
      }

      // birthdateカラムが存在するか確認
      const hasBirthdateColumn = columns && columns.length > 0 && 'birthdate' in columns[0];
      const hasBirthdayColumn = columns && columns.length > 0 && 'birthday' in columns[0];

      const updateData: any = {
        username: profile.username,
        updated_at: new Date().toISOString(),
      };

      // 適切なカラム名を使用
      if (hasBirthdateColumn) {
        updateData.birthdate = profile.birthdate;
      } else if (hasBirthdayColumn) {
        updateData.birthday = profile.birthdate;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id)
        .eq('user_id', user.id); // ユーザーIDを指定して権限を確認

      if (error) {
        console.error('プロフィール更新エラー:', error);
        toast.error('プロフィールの更新に失敗しました: ' + error.message);
        return;
      }
      
      toast.success('プロフィールを更新しました');
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('プロフィールの更新に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        toast.error('ファイルが選択されていません');
        setUploading(false);
        return;
      }
      
      const file = event.target.files[0];
      
      // ファイルサイズチェック (200KB以下)
      if (file.size > 200 * 1024) {
        toast.error('ファイルサイズは200KB以下にしてください');
        setUploading(false);
        return;
      }
      
      // 画像ファイルタイプチェック
      if (!file.type.match('image/(jpeg|png|gif)')) {
        toast.error('JPG、PNG、GIF形式の画像を選択してください');
        setUploading(false);
        return;
      }
      
      toast.loading('画像を処理中...', { id: 'upload' });
      
      // 最もシンプルな方法でBase64エンコード
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          if (!e.target || !e.target.result) {
            toast.error('画像の読み込みに失敗しました', { id: 'upload' });
            setUploading(false);
            return;
          }
          
          const base64Data = e.target.result.toString();
          
          // 画像を一時的に表示
          setAvatarUrl(base64Data);
          
          if (!profile) {
            toast.error('プロフィール情報が取得できません', { id: 'upload' });
            setUploading(false);
            return;
          }
          
          // 現在のユーザーを取得
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            toast.error('ユーザー情報が取得できません', { id: 'upload' });
            setUploading(false);
            return;
          }
          
          // プロフィールを更新（最もシンプルな方法）
          try {
            const { error } = await supabase
              .from('profiles')
              .update({ 
                avatar_url: base64Data,
                updated_at: new Date().toISOString()
              })
              .eq('id', profile.id);
            
            if (error) {
              console.error('プロフィール更新エラー:', error);
              toast.error('プロフィールの更新に失敗しました', { id: 'upload' });
              return;
            }
            
            toast.success('プロフィール画像を設定しました', { id: 'upload' });
          } catch (updateError) {
            console.error('更新処理エラー:', updateError);
            toast.error('データベース更新に失敗しました', { id: 'upload' });
          }
        } catch (processError) {
          console.error('画像処理エラー:', processError);
          toast.error('画像処理に失敗しました', { id: 'upload' });
        } finally {
          setUploading(false);
        }
      };
      
      reader.onerror = () => {
        console.error('ファイル読み込みエラー');
        toast.error('画像の読み込みに失敗しました', { id: 'upload' });
        setUploading(false);
      };
      
      // ファイルを読み込む
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('画像アップロードエラー:', error);
      toast.error('画像のアップロードに失敗しました');
      setUploading(false);
    }
  };
  
  const downloadImage = async (path: string) => {
    try {
      // Base64形式の場合は直接表示
      if (path.startsWith('data:')) {
        setAvatarUrl(path);
        return;
      }
      
      console.log('画像ダウンロード開始:', path);
      
      if (!supabase) {
        console.error('Supabaseクライアントが初期化されていません');
        return;
      }
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .download(path);
        
      if (error) {
        console.error('画像ダウンロードエラー:', error);
        throw error;
      }
      
      if (!data) {
        console.error('ダウンロードデータがありません');
        return;
      }
      
      console.log('画像ダウンロード成功:', { size: data.size, type: data.type });
      const url = URL.createObjectURL(data);
      setAvatarUrl(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };
  
  const downloadChildImage = async (path: string, childId: string) => {
    try {
      // Base64形式の場合は直接表示
      if (path.startsWith('data:')) {
        setChildren(prev => 
          prev.map(child => 
            child.id === childId 
              ? { ...child, avatarUrl: path } 
              : child
          )
        );
        return;
      }
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .download(path);
        
      if (error) {
        throw error;
      }
      
      const url = URL.createObjectURL(data);
      
      // 子供の配列を更新して画像URLを設定
      setChildren(prev => 
        prev.map(child => 
          child.id === childId 
            ? { ...child, avatarUrl: url } 
            : child
        )
      );
    } catch (error) {
      console.error('Error downloading child image:', error);
    }
  };
  
  const removeAvatar = async () => {
    try {
      if (!profile?.avatar_url) return;
      
      setUploading(true);
      toast.loading('画像を削除中...', { id: 'remove' });
      
      // プロフィールを更新（最もシンプルな方法）
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            avatar_url: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);
          
        if (error) {
          console.error('プロフィール更新エラー:', error);
          toast.error('画像の削除に失敗しました', { id: 'remove' });
          return;
        }
        
        // 画像表示をクリア
        setAvatarUrl(null);
        toast.success('プロフィール画像を削除しました', { id: 'remove' });
      } catch (updateError) {
        console.error('更新処理エラー:', updateError);
        toast.error('データベース更新に失敗しました', { id: 'remove' });
      }
    } catch (error) {
      console.error('画像削除エラー:', error);
      toast.error('画像の削除に失敗しました');
    } finally {
      setUploading(false);
      toast.dismiss('remove');
    }
  };

  // 子供のプロフィール追加
  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !newChildName.trim() || !newChildBirthday) return;

    try {
      setUpdating(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('ログインが必要です');
        return;
      }

      // データベースのスキーマを確認
      const { data: columns, error: columnsError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

      if (columnsError) {
        console.error('Failed to check database schema:', columnsError);
        toast.error('データベーススキーマの確認に失敗しました');
        setUpdating(false);
        return;
      }

      console.log('Database schema:', columns && columns.length > 0 ? Object.keys(columns[0]) : 'No columns found');

      // birthdateカラムが存在するか確認
      const hasBirthdateColumn = columns && columns.length > 0 && 'birthdate' in columns[0];
      const hasBirthdayColumn = columns && columns.length > 0 && 'birthday' in columns[0];

      console.log('Has birthdate column:', hasBirthdateColumn);
      console.log('Has birthday column:', hasBirthdayColumn);

      // 既存の子供プロフィールを確認
      const { data: existingProfiles, error: existingError } = await supabase
        .from('profiles')
        .select('id, child_number')
        .eq('parent_id', profile.id)
        .eq('role', 'child');

      if (existingError) {
        console.error('Failed to check existing profiles:', existingError);
        toast.error('既存のプロフィール確認に失敗しました');
        setUpdating(false);
        return;
      }

      // 既存の子供の数を確認し、次の子供番号を決定
      let childNumber = 1;
      if (existingProfiles && existingProfiles.length > 0) {
        // 既存の子供番号の最大値を取得
        const maxChildNumber = Math.max(...existingProfiles.map(p => p.child_number || 0));
        childNumber = maxChildNumber + 1;
      }

      console.log('Adding child with number:', childNumber);

      // 新しいUUIDを生成（プロフィールIDのみに使用）
      const randomId = crypto.randomUUID();
      
      // 直接挿入を試みる
      const insertData: any = {
        id: randomId,
        user_id: user.id, // 親のユーザーIDを使用
        username: newChildName.trim(),
        role: 'child',
        parent_id: profile.id,
        child_number: childNumber,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 適切なカラム名を使用
      if (hasBirthdateColumn) {
        insertData.birthdate = newChildBirthday;
      } else if (hasBirthdayColumn) {
        insertData.birthday = newChildBirthday;
      }

      console.log('Inserting child profile with data:', insertData);

      const { error } = await supabase
        .from('profiles')
        .insert(insertData);

      if (error) {
        console.error('Error adding child profile:', error);
        toast.error('プロフィールの追加に失敗しました: ' + error.message);
        setUpdating(false);
        return;
      }
      
      toast.success('子供のプロフィールを追加しました');
      setNewChildName('');
      setNewChildBirthday('');
      setShowAddChildForm(false);
      fetchChildren();
    } catch (error) {
      console.error('Error adding child profile:', error);
      toast.error('プロフィールの追加中にエラーが発生しました');
    } finally {
      setUpdating(false);
    }
  };

  // 子供のプロフィール更新
  const handleUpdateChild = async (childId: string, username: string, birthday: string) => {
    if (!profile?.id) return;

    try {
      setUpdating(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('ログインが必要です');
        return;
      }

      // データベースのスキーマを確認
      const { data: columns, error: columnsError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

      if (columnsError) {
        console.error('Failed to check database schema:', columnsError);
        toast.error('データベーススキーマの確認に失敗しました');
        setUpdating(false);
        return;
      }

      console.log('Database schema:', columns && columns.length > 0 ? Object.keys(columns[0]) : 'No columns found');

      // birthdateカラムが存在するか確認
      const hasBirthdateColumn = columns && columns.length > 0 && 'birthdate' in columns[0];
      const hasBirthdayColumn = columns && columns.length > 0 && 'birthday' in columns[0];

      console.log('Has birthdate column:', hasBirthdateColumn);
      console.log('Has birthday column:', hasBirthdayColumn);

      const updateData: any = {
        username: username.trim() || null,
        updated_at: new Date().toISOString()
      };

      // 適切なカラム名を使用
      if (hasBirthdateColumn) {
        updateData.birthdate = birthday || null;
      } else if (hasBirthdayColumn) {
        updateData.birthday = birthday || null;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', childId)
        .eq('role', 'child');

      if (error) {
        console.error('Error updating child profile:', error);
        toast.error('プロフィールの更新に失敗しました: ' + error.message);
        setUpdating(false);
        return;
      }

      toast.success('子供のプロフィールを更新しました');
      setEditingChild(null);
      fetchChildren();
    } catch (error) {
      console.error('Error updating child profile:', error);
      toast.error('プロフィールの更新に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  // 子供のプロフィール削除
  const handleDeleteChild = async (childId: string) => {
    if (!profile?.id) return;

    try {
      setUpdating(true);
      
      // プロフィール削除
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', childId)
        .eq('role', 'child');

      if (error) throw error;

      // 残りの子供の番号を更新
      const updatedChildren = children.filter(c => c.id !== childId);
      for (let i = 0; i < updatedChildren.length; i++) {
        await supabase
          .from('profiles')
          .update({ child_number: i + 1 })
          .eq('id', updatedChildren[i].id);
      }

      toast.success('子供のプロフィールを削除しました');
      setShowDeleteConfirm(null);
      fetchChildren();
    } catch (error) {
      console.error('Error deleting child profile:', error);
      toast.error('プロフィールの削除に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  // 子供のアバター画像アップロード
  const handleChildAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>, childId: string) => {
    if (!event.target.files || !event.target.files.length || !supabase) {
      return;
    }

    try {
      setChildUploading(childId);
      const file = event.target.files[0];
      
      // ファイルサイズチェック (200KB以下)
      if (file.size > 200 * 1024) {
        toast.error('ファイルサイズは200KB以下にしてください');
        return;
      }
      
      // 画像ファイルタイプチェック
      if (!file.type.match('image/(jpeg|png|gif)')) {
        toast.error('JPG、PNG、GIF形式の画像を選択してください');
        return;
      }
      
      toast.loading('画像を処理中...', { id: 'child-upload' });
      
      // Base64エンコード
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (!e.target?.result) return;
        
        const base64Image = e.target.result.toString();
        
        // プロフィール更新
        const { error } = await supabase
          .from('profiles')
          .update({ 
            avatar_url: base64Image,
            updated_at: new Date().toISOString()
          })
          .eq('id', childId);
          
        if (error) {
          console.error('プロフィール更新エラー:', error);
          toast.error('画像のアップロードに失敗しました', { id: 'child-upload' });
          return;
        }
        
        toast.success('プロフィール画像をアップロードしました', { id: 'child-upload' });
        
        // 子供のプロフィールを再取得
        fetchChildren();
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('画像アップロードエラー:', error);
      toast.error('画像のアップロードに失敗しました');
    } finally {
      setChildUploading(null);
      toast.dismiss('child-upload');
      // ファイル入力をリセット
      if (childFileInputRefs.current[childId]) {
        childFileInputRefs.current[childId]!.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-8 text-white shadow-lg mb-8">
        <h1 className="text-3xl font-bold mb-2">プロフィール</h1>
        <p className="text-indigo-100">基本情報の管理</p>
      </div>

      <div className="space-y-8">
        {/* 親の基本情報 */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <User className="h-6 w-6 text-indigo-600" />
              あなたの情報
            </h2>
            <button
              onClick={() => setEditMode(!editMode)}
              className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>{editMode ? '完了' : '編集'}</span>
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* プロフィール画像 */}
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div 
                  className={`w-36 h-36 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-indigo-100 shadow-md ${editMode ? 'cursor-pointer hover:opacity-90' : ''}`}
                  onClick={() => editMode && fileInputRef.current?.click()}
                >
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="プロフィール画像" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full w-full">
                      <User className="h-20 w-20 text-gray-400" />
                      {editMode && (
                        <p className="text-xs text-gray-500 mt-1">クリックして画像を選択</p>
                      )}
                    </div>
                  )}
                  
                  {uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
                    </div>
                  )}
                </div>
                
                {editMode && (
                  <div className="absolute -bottom-2 -right-2 flex gap-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-md"
                      disabled={uploading}
                      title="画像をアップロード"
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                    
                    {avatarUrl && (
                      <button
                        onClick={removeAvatar}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                        title="画像を削除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={uploadAvatar}
                accept="image/jpeg, image/png, image/gif"
                className="hidden"
              />
              
              {editMode && (
                <div className="text-center mt-2">
                  <p className="text-sm text-gray-500">
                    プロフィール画像をアップロード
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    (200KB以下のJPG、PNG、GIF)
                  </p>
                </div>
              )}
            </div>
            
            {/* プロフィール情報 */}
            <div className="flex-1 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <User className="h-4 w-4 text-indigo-500" />
                  お名前（呼び名）
                </label>
                <input
                  type="text"
                  value={profile?.username || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, username: e.target.value } : null)}
                  disabled={!editMode}
                  className={`w-full px-4 py-3 border rounded-lg transition-colors
                    ${editMode 
                      ? 'border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500' 
                      : 'bg-gray-50 border-gray-200'}`}
                  placeholder="例：まなみ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  誕生日
                </label>
                <input
                  type="date"
                  value={profile?.birthdate || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, birthdate: e.target.value } : null)}
                  disabled={!editMode}
                  className={`w-full px-4 py-3 border rounded-lg transition-colors
                    ${editMode 
                      ? 'border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500' 
                      : 'bg-gray-50 border-gray-200'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Mail className="h-4 w-4 text-indigo-500" />
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-4 py-3 border rounded-lg bg-gray-50 border-gray-200"
                />
                <p className="text-xs text-gray-500 mt-1">メールアドレスの変更は設定画面から行えます</p>
              </div>
            </div>
          </div>
          
          {editMode && (
            <button
              onClick={handleUpdateProfile}
              disabled={updating || !profile?.username}
              className="mt-8 w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 
                focus:ring-4 focus:ring-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
            >
              {updating ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  保存する
                </>
              )}
            </button>
          )}
        </div>

        {/* 子供のアカウント */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-indigo-600" />
              お子様の情報
            </h2>
            <button
              onClick={() => setShowAddChildForm(true)}
              className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>追加</span>
            </button>
          </div>
          
          {children.length === 0 ? (
            <div className="p-8 bg-gray-50 rounded-lg text-center border border-gray-100">
              <p className="text-gray-500 mb-4">まだお子様のアカウントが登録されていません</p>
              <button
                onClick={() => setShowAddChildForm(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg
                  hover:bg-indigo-700 transition-colors shadow-md"
              >
                <Plus className="h-4 w-4" />
                <span>お子様を追加する</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="p-5 bg-gray-50 rounded-lg hover:shadow-md transition-shadow border border-gray-100"
                >
                  {editingChild === child.id ? (
                    // 編集モード
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-gray-700">プロフィール編集</h3>
                        <button
                          onClick={() => setEditingChild(null)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center border-2 border-indigo-100 shadow-sm">
                            {child.avatarUrl ? (
                              <img 
                                src={child.avatarUrl} 
                                alt={`${child.username}のプロフィール画像`} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="h-8 w-8 text-indigo-600" />
                            )}
                          </div>
                          <button
                            onClick={() => childFileInputRefs.current[child.id]?.click()}
                            className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1.5 rounded-full hover:bg-indigo-700 transition-colors"
                            title="プロフィール画像をアップロード"
                            disabled={!!childUploading}
                          >
                            {childUploading === child.id ? (
                              <Loader2 className="animate-spin h-4 w-4" />
                            ) : (
                              <Camera className="h-4 w-4" />
                            )}
                          </button>
                          <input
                            type="file"
                            ref={el => childFileInputRefs.current[child.id] = el}
                            onChange={(e) => handleChildAvatarUpload(e, child.id)}
                            accept="image/jpeg, image/png, image/gif"
                            className="hidden"
                          />
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              お名前
                            </label>
                            <input
                              type="text"
                              value={child.username || ''}
                              onChange={(e) => setChildren(prev => 
                                prev.map(c => c.id === child.id ? { ...c, username: e.target.value } : c)
                              )}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              placeholder="お子様のお名前"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              誕生日
                            </label>
                            <input
                              type="date"
                              value={child.birthdate || ''}
                              onChange={(e) => setChildren(prev => 
                                prev.map(c => c.id === child.id ? { ...c, birthdate: e.target.value } : c)
                              )}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateChild(child.id, child.username || '', child.birthdate || '')}
                          disabled={updating}
                          className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 
                            transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                        >
                          {updating ? (
                            <Loader2 className="animate-spin h-4 w-4" />
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              <span>保存</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(child.id)}
                          disabled={updating}
                          className="bg-red-100 text-red-600 py-2 px-3 rounded-lg hover:bg-red-200 
                            transition-colors disabled:opacity-50 flex items-center justify-center gap-1 text-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 表示モード
                    <>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center border-2 border-indigo-100 shadow-sm">
                          {child.avatarUrl ? (
                            <img 
                              src={child.avatarUrl} 
                              alt={`${child.username}のプロフィール画像`} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-8 w-8 text-indigo-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800 flex items-center gap-2">
                            {child.username}
                            <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                              子供 #{child.child_number || 1}
                            </span>
                            <button
                              onClick={() => setEditingChild(child.id)}
                              className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-50"
                              title="編集"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {child.birthdate ? new Date(child.birthdate).toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : '誕生日未設定'}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <Link
                          to={`/parent/analytics?child=${child.id}`}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white rounded-lg border border-gray-200 
                            hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm shadow-sm"
                        >
                          <BookOpen className="h-4 w-4 text-indigo-600" />
                          <span>学習レポート</span>
                        </Link>
                        <Link
                          to={`/parent/analytics/sel?child=${child.id}`}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white rounded-lg border border-gray-200 
                            hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm shadow-sm"
                        >
                          <Heart className="h-4 w-4 text-indigo-600" />
                          <span>感情分析</span>
                        </Link>
                        <Link
                          to={`/parent/works?child=${child.id}`}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white rounded-lg border border-gray-200 
                            hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm shadow-sm"
                        >
                          <Image className="h-4 w-4 text-indigo-600" />
                          <span>投稿一覧</span>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 設定リンク */}
        <div className="text-center">
          <Link
            to="/parent/settings"
            className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-sm bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 hover:bg-indigo-50 transition-colors"
          >
            <Settings className="h-4 w-4" />
            アカウント設定はこちら
          </Link>
        </div>
      </div>

      {/* 子供追加モーダル */}
      {showAddChildForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">子供のプロフィールを追加</h2>
              <button
                onClick={() => setShowAddChildForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddChild} className="space-y-4">
              <div>
                <label htmlFor="newChildName" className="block text-sm font-medium text-gray-700 mb-1">
                  表示名
                </label>
                <input
                  id="newChildName"
                  type="text"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="表示名を入力"
                  required
                />
              </div>

              <div>
                <label htmlFor="newChildBirthday" className="block text-sm font-medium text-gray-700 mb-1">
                  誕生日
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <input
                    id="newChildBirthday"
                    type="date"
                    value={newChildBirthday}
                    onChange={(e) => setNewChildBirthday(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddChildForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={updating || !newChildName.trim() || !newChildBirthday}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {updating ? (
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

      {/* 削除確認モーダル */}
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
                onClick={() => handleDeleteChild(showDeleteConfirm)}
                disabled={updating}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {updating ? (
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
  );
}
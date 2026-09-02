import { supabase } from "./supabase";
import { FeedPost, Student } from "./feedData";

export type RealFeedPost = {
  id: string;
  student_id: string;
  type: "project" | "update" | "collab";
  content: string;
  tags: string[];
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  // Relasi
  author?: Student;
  has_liked?: boolean;
};

export type RealFeedComment = {
  id: string;
  post_id: string;
  student_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  parent_id?: string;
  author?: {
    id: string;
    name: string;
    avatarUrl: string;
    prodi: string;
    angkatan?: number;
  };
};

/**
 * Mengambil daftar post dari Supabase beserta data author (dari mahasiswa_profiles)
 */
export async function getFeedPosts(userId?: string, authorId?: string): Promise<RealFeedPost[]> {
  let query = supabase
    .from("feed_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (authorId) {
    query = query.eq("student_id", authorId);
  }

  const { data: posts, error } = await query;

  if (error) {
    console.error("Error fetching feed posts:", error.message || error);
    return [];
  }

  // Ambil data profil mahasiswa secara terpisah
  const studentIds = Array.from(new Set(posts.map(p => p.student_id)));
  let profiles: any[] = [];
  if (studentIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("mahasiswa_profiles")
      .select("id, user_id, full_name, avatar_url, prodi, angkatan")
      .in("user_id", studentIds);
    if (profilesData) profiles = profilesData;
  }

  // Jika user login, cek mana post yang sudah di like
  let likedPostIds = new Set<string>();
  if (userId) {
    const { data: likes } = await supabase
      .from("feed_post_likes")
      .select("post_id")
      .eq("student_id", userId);
    
    if (likes) {
      likes.forEach(like => likedPostIds.add(like.post_id));
    }
  }

  return posts.map(post => {
    // Cari profil yang sesuai
    const profile = profiles.find(p => p.user_id === post.student_id);
    
    return {
      ...post,
      has_liked: likedPostIds.has(post.id),
      author: profile ? {
        id: profile.user_id,
        name: profile.full_name,
        avatarUrl: profile.avatar_url,
        prodi: profile.prodi,
        angkatan: profile.angkatan,
      } : {
        id: post.student_id,
        name: "Unknown User",
        avatarUrl: "",
        prodi: "Mahasiswa",
        angkatan: 2024
      }
    };
  });
}

/**
 * Membuat post baru
 */
export async function createFeedPost(data: {
  student_id: string;
  type: "project" | "update" | "collab";
  content: string;
  tags: string[];
  image_url?: string;
}) {
  const { data: newPost, error } = await supabase
    .from("feed_posts")
    .insert([{
      student_id: data.student_id,
      type: data.type,
      content: data.content,
      tags: data.tags,
      image_url: data.image_url || null
    }])
    .select()
    .single();

  if (error) throw error;
  return newPost;
}

/**
 * Menghapus post milik sendiri
 */
export async function deleteFeedPost(postId: string, userId: string) {
  const { error } = await supabase
    .from("feed_posts")
    .delete()
    .match({ id: postId, student_id: userId });

  if (error) throw error;
  return true;
}

/**
 * Toggle like untuk sebuah post
 */
export async function toggleFeedPostLike(postId: string, userId: string, currentlyLiked: boolean) {
  if (currentlyLiked) {
    const { error } = await supabase
      .from("feed_post_likes")
      .delete()
      .match({ post_id: postId, student_id: userId });
    if (error) throw error;
    return false;
  } else {
    const { error } = await supabase
      .from("feed_post_likes")
      .insert([{ post_id: postId, student_id: userId }]);
    // Ignore duplicate errors if they double click
    if (error && error.code !== '23505') throw error; 
    return true;
  }
}

/**
 * Mengambil komentar untuk suatu post
 */
export async function getFeedComments(postId: string): Promise<RealFeedComment[]> {
  const { data, error } = await supabase
    .from("feed_post_comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error.message || error);
    return [];
  }

  // Fetch profil
  const studentIds = Array.from(new Set((data || []).map(c => c.student_id)));
  let profiles: any[] = [];
  if (studentIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("mahasiswa_profiles")
      .select("id, user_id, full_name, avatar_url, prodi")
      .in("user_id", studentIds);
    if (profilesData) profiles = profilesData;
  }

  return data.map(comment => {
    const profile = profiles.find(p => p.user_id === comment.student_id);
    return {
      ...comment,
      author: profile ? {
        id: profile.user_id,
        name: profile.full_name,
        avatarUrl: profile.avatar_url,
        prodi: profile.prodi,
      } : {
        id: comment.student_id,
        name: "Unknown User",
        avatarUrl: "",
        prodi: "Mahasiswa"
      }
    };
  });
}

/**
 * Tambah komentar baru
 */
export async function addFeedComment(postId: string, userId: string, content: string, parentId?: string) {
  const { data: newComment, error } = await supabase
    .from("feed_post_comments")
    .insert([{
      post_id: postId,
      student_id: userId,
      content: content,
      parent_id: parentId || null
    }])
    .select()
    .single();

  if (error) throw error;
  return newComment;
}

/**
 * Hapus komentar milik sendiri
 */
export async function deleteFeedComment(commentId: string, userId: string) {
  const { error } = await supabase
    .from("feed_post_comments")
    .delete()
    .match({ id: commentId, student_id: userId });

  if (error) throw error;
  return true;
}

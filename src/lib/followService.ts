import { supabase } from "./supabase";

/**
 * Toggle follow/unfollow a user
 * @param targetUserId ID user yang akan difollow/unfollow (following_id)
 * @param currentUserId ID user yang login (follower_id)
 * @param currentlyFollowing Apakah saat ini sedang follow?
 * @returns boolean true jika berhasil follow, false jika berhasil unfollow
 */
export async function toggleFollow(
  targetUserId: string,
  currentUserId: string,
  currentlyFollowing: boolean
): Promise<boolean> {
  if (currentlyFollowing) {
    // Unfollow
    const { error } = await supabase
      .from("student_followers")
      .delete()
      .match({ follower_id: currentUserId, following_id: targetUserId });
    
    if (error) throw error;
    return false;
  } else {
    // Follow
    const { error } = await supabase
      .from("student_followers")
      .insert([{ follower_id: currentUserId, following_id: targetUserId }]);
    
    if (error && error.code !== "23505") { // Ignore duplicate key errors if already following
      throw error;
    }
    return true;
  }
}

/**
 * Cek apakah currentUserId mem-follow targetUserId
 */
export async function checkIsFollowing(
  targetUserId: string,
  currentUserId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("student_followers")
    .select("id")
    .match({ follower_id: currentUserId, following_id: targetUserId })
    .single();

  if (error && error.code !== "PGRST116") { // Ignore no rows error
    console.error("Error checking follow status:", error.message);
    return false;
  }

  return !!data;
}

/**
 * Mengambil status follow secara masal untuk beberapa targetUserId (berguna untuk array rekomendasi)
 */
export async function checkIsFollowingBulk(
  targetUserIds: string[],
  currentUserId: string
): Promise<Record<string, boolean>> {
  const { data, error } = await supabase
    .from("student_followers")
    .select("following_id")
    .eq("follower_id", currentUserId)
    .in("following_id", targetUserIds);

  if (error) {
    console.error("Error checking bulk follow status:", error.message);
    return {};
  }

  const result: Record<string, boolean> = {};
  data?.forEach((row) => {
    result[row.following_id] = true;
  });
  return result;
}

export async function getFollowersList(userId: string) {
  // 1. Get follower IDs
  const { data: followers, error: fError } = await supabase
    .from("student_followers")
    .select("follower_id")
    .eq("following_id", userId);

  if (fError || !followers || followers.length === 0) return [];

  const followerIds = followers.map((f) => f.follower_id);

  // 2. Get profiles
  const { data: profiles, error: pError } = await supabase
    .from("mahasiswa_profiles")
    .select("id, user_id, full_name, avatar_url, prodi")
    .in("user_id", followerIds);

  if (pError) return [];
  return profiles;
}

export async function getFollowingList(userId: string) {
  // 1. Get following IDs
  const { data: following, error: fError } = await supabase
    .from("student_followers")
    .select("following_id")
    .eq("follower_id", userId);

  if (fError || !following || following.length === 0) return [];

  const followingIds = following.map((f) => f.following_id);

  // 2. Get profiles
  const { data: profiles, error: pError } = await supabase
    .from("mahasiswa_profiles")
    .select("id, user_id, full_name, avatar_url, prodi")
    .in("user_id", followingIds);

  if (pError) return [];
  return profiles;
}

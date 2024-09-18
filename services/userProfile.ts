import { Session } from "next-auth";

export interface GithubRepo {
  id: string;
  name: string;
  url: string;
}

export interface UserProfile {
  githubRepos: GithubRepo[];
}

export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const response = await fetch(`/api/user/profile?userId=${userId}`);
  return await response.json();
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await fetch('/api/user/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, ...data }),
  });
  return await response.json();
};
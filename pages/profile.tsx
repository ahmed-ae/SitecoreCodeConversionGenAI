import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import GithubConnection from "@/Components/GithubConnection";
import { getUserProfile, updateUserProfile, GithubRepo } from "@/services/userProfile";

const ProfilePage = () => {
  const { data: session } = useSession();
  const [githubRepos, setGithubRepos] = useState<GithubRepo[]>([]);

  useEffect(() => {
    if (session?.user?.id) {
      loadUserProfile();
    }
  }, [session?.user?.id]);

  const loadUserProfile = async () => {
    if (session?.user?.id) {
      const profile = await getUserProfile(session.user.id);
      setGithubRepos(profile.githubRepos || []);
    }
  };

  const handleAddRepo = async (repo: GithubRepo) => {
    if (session?.user?.id) {
        const updatedRepos = [...githubRepos, repo];
        setGithubRepos(updatedRepos);
        await updateUserProfile(session.user.id, { githubRepos: updatedRepos });
    }
  };

  const handleDeleteRepo = async (repoId: string) => {
    if (session?.user?.id) {
        const updatedRepos = githubRepos.filter(repo => repo.id !== repoId);
        setGithubRepos(updatedRepos);
        await updateUserProfile(session.user.id, { githubRepos: updatedRepos });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
      <Header
        CountUsage={0}
        maxTries={0}
        session={session}
        disableLoginAndMaxTries={false}
      />
      <div className="container mx-auto py-6 sm:py-12 px-4 max-w-full w-full sm:w-[95%]">
        <h1 className="text-3xl font-bold mb-6">User Profile</h1>
        {session?.user && (
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">User Information</h2>
            <p><strong>Name:</strong> {session.user.name}</p>
            <p><strong>Email:</strong> {session.user.email}</p>
          </div>
        )}
        <GithubConnection
          githubRepos={githubRepos}
          onAddRepo={handleAddRepo}
          onDeleteRepo={handleDeleteRepo}
        />
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
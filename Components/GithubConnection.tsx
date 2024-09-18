import React, { useState } from "react";
import { GithubRepo } from "@/services/userProfile";

interface GithubConnectionProps {
  githubRepos: GithubRepo[];
  onAddRepo: (repo: GithubRepo) => void;
  onDeleteRepo: (repoId: string) => void;
}

const GithubConnection: React.FC<GithubConnectionProps> = ({
  githubRepos,
  onAddRepo,
  onDeleteRepo,
}) => {
  const [newRepo, setNewRepo] = useState({ name: "", url: "" });

  const handleAddRepo = () => {
    if (newRepo.name && newRepo.url) {
      onAddRepo({ id: Date.now().toString(), ...newRepo });
      setNewRepo({ name: "", url: "" });
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-2xl font-semibold mb-4">GitHub Connections</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Repository Name"
          value={newRepo.name}
          onChange={(e) => setNewRepo({ ...newRepo, name: e.target.value })}
          className="bg-gray-700 text-white px-3 py-2 rounded mr-2"
        />
        <input
          type="text"
          placeholder="Repository URL"
          value={newRepo.url}
          onChange={(e) => setNewRepo({ ...newRepo, url: e.target.value })}
          className="bg-gray-700 text-white px-3 py-2 rounded mr-2"
        />
        <button
          onClick={handleAddRepo}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Repository
        </button>
      </div>
      <ul>
        {githubRepos.map((repo) => (
          <li key={repo.id} className="flex justify-between items-center mb-2">
            <span>{repo.name} - {repo.url}</span>
            <button
              onClick={() => onDeleteRepo(repo.id)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GithubConnection;
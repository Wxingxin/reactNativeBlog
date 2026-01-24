import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useUserStore } from "../store/user.store";

export default function A() {
  // Selector：取出异步相关状态与动作
  const {
    users,
    user,
    status,
    userStatus,
    error,
    userError,
    lastFetchedAt,
    fetchUsers,
    fetchUserById,
    refreshUsers,
    searchTerm,
    searchResults,
    searchUsersByName,
    clearSearch,
    clearUser,
  } = useUserStore(
    useShallow((s) => ({
      users: s.users,
      user: s.user,
      status: s.status,
      userStatus: s.userStatus,
      error: s.error,
      userError: s.userError,
      lastFetchedAt: s.lastFetchedAt,
      fetchUsers: s.fetchUsers,
      fetchUserById: s.fetchUserById,
      refreshUsers: s.refreshUsers,
      searchTerm: s.searchTerm,
      searchResults: s.searchResults,
      searchUsersByName: s.searchUsersByName,
      clearSearch: s.clearSearch,
      clearUser: s.clearUser,
    }))
  );

  // 输入框：按 ID 查询单个用户
  const [userIdInput, setUserIdInput] = useState("");

  return (
    <div>
      <h2>异步逻辑示例（Users）</h2>

      <div>
        <button onClick={fetchUsers}>load users</button>
        <button onClick={refreshUsers}>refresh</button>
        <span> last: {lastFetchedAt ?? "-"}</span>
      </div>

      {status === "loading" && <div>Loading users...</div>}
      {status === "error" && <div>Error: {error}</div>}
      {status === "success" && (
        <ul>
          {users.map((u) => (
            <li key={u.id}>{u.name}</li>
          ))}
        </ul>
      )}

      <hr />

      <div>
        <input
          value={userIdInput}
          onChange={(e) => setUserIdInput(e.target.value)}
          placeholder="User id (1-10)"
        />
        <button onClick={() => fetchUserById(userIdInput)}>load by id</button>
        <button onClick={clearUser}>clear</button>
      </div>

      {userStatus === "loading" && <div>Loading user...</div>}
      {userStatus === "error" && <div>Error: {userError}</div>}
      {user && (
        <div>
          <div>name: {user.name}</div>
          <div>email: {user.email}</div>
        </div>
      )}

      <hr />

      <div>
        <input
          value={searchTerm}
          onChange={(e) => searchUsersByName(e.target.value)}
          placeholder="Search by name"
        />
        <button onClick={clearSearch}>clear</button>
      </div>
      <div>{searchResults.map((u) => u.name).join(", ")}</div>
    </div>
  );
}

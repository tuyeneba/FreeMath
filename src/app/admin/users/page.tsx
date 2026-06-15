"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useLang } from "@/context/LangContext";

interface ManagedUser {
  id: string;
  username: string;
  fullName: string;
  role: string;
  level: string;
  powerScore: number;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { user } = useUser();
  const { language } = useLang();
  const router = useRouter();

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<ManagedUser | null>(null);

  // Form fields state
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    password: "",
    role: "user",
    level: "fingermath",
    powerScore: 0,
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      if (!res.ok) {
        throw new Error(language === "vi" ? "Không thể tải danh sách người dùng" : "Failed to load user list");
      }
      const data = (await res.json()) as ManagedUser[];
      setUsers(data);
      setError("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (language === "vi" ? "Có lỗi xảy ra" : "An error occurred");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    // Check if user is logged in and is an admin
    if (!user) {
      router.push("/");
      return;
    }
    if (user.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    const timer = setTimeout(() => {
      void fetchUsers();
    }, 0);
    return () => clearTimeout(timer);
  }, [user, router, fetchUsers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "powerScore" ? parseInt(value) || 0 : value,
    }));
  };

  const openAddModal = () => {
    setFormData({
      username: "",
      fullName: "",
      password: "",
      role: "user",
      level: "fingermath",
      powerScore: 0,
    });
    setError("");
    setShowAddModal(true);
  };

  const openEditModal = (u: ManagedUser) => {
    setUserToEdit(u);
    setFormData({
      username: u.username,
      fullName: u.fullName,
      password: "", // Keep empty unless updating
      role: u.role,
      level: u.level,
      powerScore: u.powerScore,
    });
    setError("");
    setShowEditModal(true);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.fullName || !formData.password) {
      setError(language === "vi" ? "Vui lòng điền đầy đủ các thông tin bắt buộc" : "Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || (language === "vi" ? "Có lỗi xảy ra" : "An error occurred"));
      }

      setShowAddModal(false);
      fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (language === "vi" ? "Có lỗi xảy ra" : "An error occurred");
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;

    if (!formData.fullName) {
      setError(language === "vi" ? "Tên hiển thị không được để trống" : "Display name cannot be empty");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const res = await fetch(`/api/users/${userToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          password: formData.password || undefined,
          role: formData.role,
          level: formData.level,
          powerScore: formData.powerScore,
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || (language === "vi" ? "Có lỗi xảy ra" : "An error occurred"));
      }

      setShowEditModal(false);
      setUserToEdit(null);
      fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (language === "vi" ? "Có lỗi xảy ra" : "An error occurred");
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, username: string) => {
    const confirmMsg = language === "vi" 
      ? `Bạn có chắc chắn muốn xóa người dùng "${username}" không? Hành động này không thể hoàn tác.` 
      : `Are you sure you want to delete user "${username}"? This action cannot be undone.`;
    
    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      setError("");
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || (language === "vi" ? "Có lỗi xảy ra khi xóa" : "An error occurred during deletion"));
      }

      fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (language === "vi" ? "Có lỗi xảy ra" : "An error occurred");
      setError(msg);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "2rem 1rem", minHeight: "80vh" }}>
      {/* Header */}
      <div 
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem" 
        }}
      >
        <div>
          <h1 
            style={{ 
              fontFamily: "var(--font-outfit)", 
              fontWeight: 800, 
              fontSize: "2rem",
              background: "linear-gradient(135deg, var(--text-primary), var(--accent))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "0.25rem"
            }}
          >
            {language === "vi" ? "Quản lý Người dùng" : "User Management"}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            {language === "vi" ? "Thêm, chỉnh sửa và quản lý phân quyền thành viên" : "Add, edit and manage user credentials and roles"}
          </p>
        </div>

        <button 
          onClick={openAddModal}
          className="btn btn-primary"
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "0.5rem",
            padding: "0.6rem 1.2rem",
            fontWeight: 600
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          {language === "vi" ? "Thêm người dùng" : "Add User"}
        </button>
      </div>

      {error && (
        <div 
          style={{ 
            backgroundColor: "rgba(239, 68, 68, 0.1)", 
            border: "1px solid rgb(239, 68, 68)", 
            color: "rgb(239, 68, 68)",
            padding: "0.75rem 1rem",
            borderRadius: "var(--border-radius-md)",
            marginBottom: "1.5rem",
            fontSize: "0.9rem",
            fontWeight: 500
          }}
        >
          {error}
        </div>
      )}

      {/* Table Container */}
      <div 
        style={{ 
          backgroundColor: "var(--bg-secondary)", 
          borderRadius: "var(--border-radius-lg)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)",
          overflowX: "auto"
        }}
      >
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "4rem" }}>
            <div className="spinner"></div>
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--text-secondary)" }}>
            {language === "vi" ? "Chưa có người dùng nào" : "No users found"}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)", textAlign: "left", backgroundColor: "rgba(0,0,0,0.02)" }}>
                <th style={{ padding: "1rem 1.25rem", color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.85rem" }}>
                  {language === "vi" ? "Tên tài khoản" : "Username"}
                </th>
                <th style={{ padding: "1rem 1.25rem", color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.85rem" }}>
                  {language === "vi" ? "Họ và tên" : "Full Name"}
                </th>
                <th style={{ padding: "1rem 1.25rem", color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.85rem" }}>
                  {language === "vi" ? "Vai trò" : "Role"}
                </th>
                <th style={{ padding: "1rem 1.25rem", color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.85rem" }}>
                  {language === "vi" ? "Trình độ" : "Level"}
                </th>
                <th style={{ padding: "1rem 1.25rem", color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.85rem" }}>
                  {language === "vi" ? "Điểm năng lượng" : "Power Score"}
                </th>
                <th style={{ padding: "1rem 1.25rem", color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.85rem" }}>
                  {language === "vi" ? "Ngày tạo" : "Created At"}
                </th>
                <th style={{ padding: "1rem 1.25rem", color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.85rem", textAlign: "right" }}>
                  {language === "vi" ? "Hành động" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid var(--border-color)", transition: "background 0.2s" }} className="table-row-hover">
                  <td style={{ padding: "1rem 1.25rem", fontWeight: 600 }}>{u.username}</td>
                  <td style={{ padding: "1rem 1.25rem" }}>{u.fullName}</td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span 
                      style={{ 
                        display: "inline-block",
                        padding: "0.2rem 0.6rem", 
                        borderRadius: "12px", 
                        fontSize: "0.75rem", 
                        fontWeight: 700,
                        backgroundColor: u.role === "admin" ? "rgba(224, 86, 36, 0.15)" : "rgba(59, 130, 246, 0.15)",
                        color: u.role === "admin" ? "var(--accent)" : "rgb(59, 130, 246)"
                      }}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.25rem", textTransform: "capitalize" }}>
                    {u.level === "fingermath" ? "Fingermath" : u.level === "soroban" ? "Soroban" : "Super"}
                  </td>
                  <td style={{ padding: "1rem 1.25rem", fontWeight: 700, color: "var(--accent)" }}>{u.powerScore}</td>
                  <td style={{ padding: "1rem 1.25rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                      <button 
                        onClick={() => openEditModal(u)}
                        className="btn btn-secondary"
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", minHeight: "auto" }}
                      >
                        {language === "vi" ? "Sửa" : "Edit"}
                      </button>
                      {u.username !== "admin" && (
                        <button 
                          onClick={() => {
                            void handleDeleteUser(u.id, u.username);
                          }}
                          style={{ 
                            padding: "0.4rem 0.8rem", 
                            fontSize: "0.8rem", 
                            minHeight: "auto",
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                            color: "rgb(239, 68, 68)",
                            border: "1px solid rgba(239, 68, 68, 0.2)",
                            borderRadius: "var(--border-radius-md)",
                            cursor: "pointer",
                            fontWeight: 600
                          }}
                        >
                          {language === "vi" ? "Xóa" : "Delete"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Backdrop Styles & Animation helpers */}
      <style jsx>{`
        .table-row-hover:hover {
          background-color: rgba(var(--accent-rgb, 224, 86, 36), 0.02);
        }
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 1rem;
        }
        .modal-content {
          background-color: var(--bg-secondary);
          border-radius: var(--border-radius-lg);
          border: 1px solid var(--border-color);
          width: 100%;
          max-width: 500px;
          padding: 2rem;
          box-shadow: var(--shadow-lg);
          animation: slideUp 0.3s ease-out;
        }
        .form-group {
          margin-bottom: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .form-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .form-input, .form-select {
          padding: 0.6rem 0.75rem;
          border-radius: var(--border-radius-md);
          border: 1px solid var(--border-color);
          background-color: var(--bg-primary);
          color: var(--text-primary);
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input:focus, .form-select:focus {
          border-color: var(--accent);
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontFamily: "var(--font-outfit)", fontWeight: 700, fontSize: "1.5rem", marginBottom: "1.5rem" }}>
              {language === "vi" ? "Thêm Người dùng Mới" : "Add New User"}
            </h2>
            <form onSubmit={(e) => { void handleAddUser(e); }}>
              <div className="form-group">
                <label className="form-label">{language === "vi" ? "Tên tài khoản (viết liền, không dấu) *" : "Username *"}</label>
                <input 
                  type="text" 
                  name="username" 
                  className="form-input"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{language === "vi" ? "Họ và tên *" : "Full Name *"}</label>
                <input 
                  type="text" 
                  name="fullName" 
                  className="form-input"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{language === "vi" ? "Mật khẩu *" : "Password *"}</label>
                <input 
                  type="password" 
                  name="password" 
                  className="form-input"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{language === "vi" ? "Vai trò" : "Role"}</label>
                <select name="role" className="form-select" value={formData.role} onChange={handleInputChange}>
                  <option value="user">USER</option>
                  <option value="admin">ADMIN</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{language === "vi" ? "Trình độ ban đầu" : "Initial Level"}</label>
                <select name="level" className="form-select" value={formData.level} onChange={handleInputChange}>
                  <option value="fingermath">Fingermath</option>
                  <option value="soroban">Soroban</option>
                  <option value="super">Super</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{language === "vi" ? "Điểm năng lượng ban đầu" : "Initial Power Score"}</label>
                <input 
                  type="number" 
                  name="powerScore" 
                  className="form-input"
                  value={formData.powerScore}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>

              {error && (
                <div style={{ color: "rgb(239, 68, 68)", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "2rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  {language === "vi" ? "Hủy" : "Cancel"}
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (language === "vi" ? "Đang lưu..." : "Saving...") : (language === "vi" ? "Tạo tài khoản" : "Create Account")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && userToEdit && (
        <div className="modal-backdrop" onClick={() => { setShowEditModal(false); setUserToEdit(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontFamily: "var(--font-outfit)", fontWeight: 700, fontSize: "1.5rem", marginBottom: "1.5rem" }}>
              {language === "vi" ? `Chỉnh sửa: ${userToEdit.username}` : `Edit User: ${userToEdit.username}`}
            </h2>
            <form onSubmit={(e) => { void handleEditUser(e); }}>
              <div className="form-group">
                <label className="form-label">{language === "vi" ? "Họ và tên *" : "Full Name *"}</label>
                <input 
                  type="text" 
                  name="fullName" 
                  className="form-input"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{language === "vi" ? "Mật khẩu mới (để trống nếu không đổi)" : "New Password (leave blank to keep current)"}</label>
                <input 
                  type="password" 
                  name="password" 
                  className="form-input"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{language === "vi" ? "Vai trò" : "Role"}</label>
                <select 
                  name="role" 
                  className="form-select" 
                  value={formData.role} 
                  onChange={handleInputChange}
                  disabled={userToEdit.username === "admin"}
                >
                  <option value="user">USER</option>
                  <option value="admin">ADMIN</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{language === "vi" ? "Trình độ" : "Level"}</label>
                <select name="level" className="form-select" value={formData.level} onChange={handleInputChange}>
                  <option value="fingermath">Fingermath</option>
                  <option value="soroban">Soroban</option>
                  <option value="super">Super</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{language === "vi" ? "Điểm năng lượng" : "Power Score"}</label>
                <input 
                  type="number" 
                  name="powerScore" 
                  className="form-input"
                  value={formData.powerScore}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>

              {error && (
                <div style={{ color: "rgb(239, 68, 68)", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "2rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowEditModal(false); setUserToEdit(null); }}>
                  {language === "vi" ? "Hủy" : "Cancel"}
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (language === "vi" ? "Đang lưu..." : "Saving...") : (language === "vi" ? "Lưu thay đổi" : "Save Changes")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

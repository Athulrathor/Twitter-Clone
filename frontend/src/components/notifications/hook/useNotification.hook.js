import axiosInstance from "../../../lib/axiosInstance";
import { auth } from "../../../context/firebase";

async function getToken() {
  return await auth.currentUser?.getIdToken();
}

export async function getNotifications() {
  const token = await getToken();

  return axiosInstance.get("/notifications", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function unreadCount() {
  const token = await getToken();

  return axiosInstance.get("/notifications/unread-count", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function markAsRead(id) {
  const token = await getToken();

  return axiosInstance.patch(
    `/notifications/${id}/read`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export async function markAllRead() {
  const token = await getToken();

  return axiosInstance.patch(
    "/notifications/read-all",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}
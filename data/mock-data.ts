import { User } from "@/lib/types";

export const MOCK_USERS: User[] = [
  {
    id: "user-1",
    name: "Alice Admin",
    email: "admin@telya.com",
    role: "admin",
    avatarUrl: "https://i.pravatar.cc/150?u=admin@telya.com",
  },
  {
    id: "user-2",
    name: "Bob Employee",
    email: "employee@telya.com",
    role: "employee",
    avatarUrl: "https://i.pravatar.cc/150?u=employee@telya.com",
  },
  {
    id: "user-3",
    name: "Charlie Client",
    email: "client@telya.com",
    role: "client",
    avatarUrl: "https://i.pravatar.cc/150?u=client@telya.com",
  },
];

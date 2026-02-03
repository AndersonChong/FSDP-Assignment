import { auth } from "../firebase";

export async function getAuthHeader() {
  const user = auth.currentUser;

  if (!user) {
    console.warn("No Firebase user logged in");
    return {};
  }

  const token = await user.getIdToken();

  return {
    Authorization: `Bearer ${token}`,
  };
}

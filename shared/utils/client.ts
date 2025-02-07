
export const getAuthTokenOnClient = async () => {
  const res = await fetch(`/api/get-token`);
  const token = await res.json();
  if (token.success) return token.token;
  throw new Error(token.error);

}


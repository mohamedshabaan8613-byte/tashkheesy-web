// Placeholder auth hook for static project
export function useAuth() {
  return {
    user: null as null | { name: string; email: string },
    isLoading: false,
    loading: false,
    logout: () => {},
  };
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
console.log('API FILE LOADED - getStoryViewers:', typeof (() => { }))
const request = async (method, path, data = null, isFormData = false) => {
  const token = localStorage.getItem('pingup_token')
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (!isFormData) headers['Content-Type'] = 'application/json'

  const config = { method, headers }
  if (data) config.body = isFormData ? data : JSON.stringify(data)

  const res = await fetch(`${BASE_URL}${path}`, config)
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Something went wrong')
  return json
}

export const api = {
  // Auth
  signup: (data) => request('POST', '/auth/signup', data),
  login: (data) => request('POST', '/auth/login', data),
  forgotPassword: (data) => request('POST', '/auth/forgot-password', data),
  resetPassword: (data) => request('POST', '/auth/reset-password', data),

  // Profile
  getMyProfile: () => request('GET', '/users/me'),
  getUserById: (id) => request('GET', `/users/${id}`),
  updateProfile: (data) => request('PUT', '/users/update-profile', data),
  updateProfilePicture: (fd) => request('PUT', '/users/update-profile-picture', fd, true),
  updateCoverPhoto: (fd) => request('PUT', '/users/update-cover-photo', fd, true),

  // Social
  toggleFollow: (targetId) => request('POST', `/users/follow/${targetId}`),
  getFollowers: (id) => request('GET', `/users/followers/${id}`),
  getFollowing: (id) => request('GET', `/users/following/${id}`),
  discoverUsers: (q = '', page = 1) => request('GET', `/users/discover?q=${encodeURIComponent(q)}&page=${page}`),

  // Posts
  getFeed: (page = 1) => request('GET', `/posts/feed?page=${page}`),
  getUserPosts: (userId, page = 1) => request('GET', `/posts/user/${userId}?page=${page}`),
  createPost: (fd) => request('POST', '/posts/create', fd, true),
  toggleLike: (postId) => request('POST', `/posts/like/${postId}`),
  deletePost: (postId) => request('DELETE', `/posts/${postId}`),
  toggleVisibility: (postId) => request('PATCH', `/posts/${postId}/visibility`),
  getComments: (postId) => request('GET', `/comments/${postId}`),
  addComment: (postId, text) => request('POST', `/comments/${postId}`, { text }),
  deleteComment: (commentId) => request('DELETE', `/comments/${commentId}`),
  likeComment: (commentId) => request('POST', `/comments/like/${commentId}`),
  deleteMessage: (messageId) => request('DELETE', `/messages/${messageId}`),

  // Stories
  getStories: () => request('GET', '/stories'),
  createStory: (fd) => request('POST', '/stories/create', fd, true),
  viewStory: (storyId) => request('POST', `/stories/view/${storyId}`),
  deleteStory: (storyId) => request('DELETE', `/stories/${storyId}`),
  likeStory: (storyId) => request('POST', `/stories/like/${storyId}`),
  getStoryViewers: (storyId) => { console.log('getStoryViewers called!'); return request('GET', `/stories/viewers/${storyId}`) },

  // Messages
  getInbox: () => request('GET', '/messages'),
  getConversation: (partnerId, page = 1) => request('GET', `/messages/${partnerId}?page=${page}`),
  sendMessage: (fd) => request('POST', '/messages/send', fd, true),
  getRecentMessages: () => request('GET', '/messages/recent'),

  // Connections
  getMyFollowers: () => request('GET', '/connections/followers'),
  getMyFollowing: () => request('GET', '/connections/following'),
  getMyConnections: () => request('GET', '/connections/connections'),
  getPendingConnections: () => request('GET', '/connections/pending'),
  getSuggestions: () => request('GET', '/connections/suggestions'),
}

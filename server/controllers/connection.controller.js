import User from '../models/User.model.js'

const selectFields = '_id full_name username profile_picture bio is_verified'

export const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('followers', selectFields)
    res.json({ success: true, followers: user.followers })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('following', selectFields)
    res.json({ success: true, following: user.following })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getConnections = async (req, res) => {
  try {
    // Mutual follows = connections
    const user = await User.findById(req.user._id)
    const myFollowingIds = user.following.map(String)
    const myFollowerIds = user.followers.map(String)
    const mutualIds = myFollowingIds.filter((id) => myFollowerIds.includes(id))
    const connections = await User.find({ _id: { $in: mutualIds } }).select(selectFields)
    res.json({ success: true, connections })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getPendingConnections = async (req, res) => {
  try {
    // Pending = people who follow me but I don't follow back
    const user = await User.findById(req.user._id)
    const myFollowingIds = user.following.map(String)
    const pendingIds = user.followers.filter((id) => !myFollowingIds.includes(id.toString()))
    const pending = await User.find({ _id: { $in: pendingIds } }).select(selectFields)
    res.json({ success: true, pending })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getSuggestions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const exclude = [...user.following.map(String), req.user._id.toString()]

    // Friends of friends
    const friendDocs = await User.find({ _id: { $in: user.following } }).select('following')
    const fofIds = friendDocs.flatMap((f) => f.following.map(String)).filter((id) => !exclude.includes(id))
    const uniqueFof = [...new Set(fofIds)].slice(0, 10)

    let suggestions = await User.find({ _id: { $in: uniqueFof } }).select(selectFields + ' followers')

    if (suggestions.length < 5) {
      const fallback = await User.find({ _id: { $nin: exclude } })
        .select(selectFields + ' followers')
        .limit(10 - suggestions.length)
      suggestions = [...suggestions, ...fallback]
    }

    res.json({ success: true, suggestions })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

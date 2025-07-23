// Mock data for development when backend is not available
export const mockPosts = [
  {
    id: 1,
    author: {
      name: "John Smith",
      avatar: "https://via.placeholder.com/48/4f46e5/fff?text=JS",
      followers: "500+"
    },
    content: "Excited to share that I've just completed a full-stack social media application using React and Node.js! 🚀\n\nKey features implemented:\n- User authentication & authorization\n- Real-time messaging\n- Post creation and sharing\n- LinkedIn-style feed\n- Responsive design\n\n#React #NodeJS #FullStack #WebDevelopment",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    likes: 45,
    isLiked: false,
    isFollowed: false,
    comments: [
      {
        id: 1,
        author: {
          name: "Sarah Johnson",
          avatar: "https://via.placeholder.com/32/e91e63/fff?text=SJ",
          title: "Senior Frontend Developer"
        },
        text: "Congratulations! This looks like an amazing project. Would love to see a demo!",
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ]
  },
  {
    id: 2,
    author: {
      name: "Tech Innovation Corp",
      avatar: "https://via.placeholder.com/48/2196f3/fff?text=TI",
      followers: "10,234"
    },
    content: "We're hiring! Looking for passionate developers to join our team.\n\nOpen positions:\n- Senior React Developer\n- Node.js Backend Engineer\n- DevOps Engineer\n- UI/UX Designer\n\nInterested? Send us your resume! 💼",
    jobDetails: [
      "Remote-first company culture",
      "Competitive salary and benefits", 
      "Professional development budget",
      "Flexible working hours"
    ],
    callToAction: "Ready to make an impact?",
    applyInfo: "Apply at: careers@techinnovation.com",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    likes: 128,
    isLiked: true,
    isFollowed: true,
    comments: []
  },
  {
    id: 3,
    author: {
      name: "Emily Chen",
      avatar: "https://via.placeholder.com/48/9c27b0/fff?text=EC",
      followers: "1,245"
    },
    content: "Just attended an amazing conference on modern web technologies! Key takeaways:\n\n1. Server-side rendering is making a comeback\n2. Edge computing is the future\n3. AI integration in web apps is becoming mainstream\n4. Performance optimization remains critical\n\nWhat trends are you most excited about? #WebDev #TechTrends #AI",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    likes: 67,
    isLiked: false,
    isFollowed: false,
    comments: [
      {
        id: 2,
        author: {
          name: "Mike Rodriguez",
          avatar: "https://via.placeholder.com/32/ff9800/fff?text=MR"
        },
        text: "Great insights! I'm particularly interested in the AI integration aspect.",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
      }
    ]
  }
];

// Mock API responses
export const mockAPI = {
  getPosts: (page = 1, limit = 10) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const posts = mockPosts.slice(startIndex, endIndex);
        
        resolve({
          data: {
            posts: posts,
            total: mockPosts.length,
            page: page,
            totalPages: Math.ceil(mockPosts.length / limit)
          }
        });
      }, 1000); // Simulate network delay
    });
  },

  createPost: (postData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPost = {
          id: Date.now(),
          author: {
            name: "You",
            avatar: "https://via.placeholder.com/48/4f46e5/fff?text=Y",
            followers: "0"
          },
          content: postData.content,
          createdAt: new Date(),
          likes: 0,
          isLiked: false,
          isFollowed: false,
          comments: []
        };
        
        mockPosts.unshift(newPost);
        resolve({ data: newPost });
      }, 500);
    });
  },

  toggleLike: (postId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const post = mockPosts.find(p => p.id === postId);
        if (post) {
          post.isLiked = !post.isLiked;
          post.likes += post.isLiked ? 1 : -1;
        }
        resolve({ data: { success: true } });
      }, 300);
    });
  },

  toggleFollow: (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { success: true } });
      }, 300);
    });
  }
};

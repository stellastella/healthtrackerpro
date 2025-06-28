import React, { useState } from 'react';
import { MessageSquare, Heart, Reply, Flag, User } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  publishedAt: string;
  likes: number;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { isDark } = useTheme();
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: { name: 'Sarah Johnson', avatar: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
      content: 'This article really helped me understand the DASH diet better. I\'ve been struggling with high blood pressure and this gives me a clear action plan.',
      publishedAt: '2024-01-15T10:30:00Z',
      likes: 12,
      replies: [
        {
          id: '2',
          author: { name: 'Dr. Michael Chen' },
          content: 'I\'m glad you found it helpful, Sarah! Remember to consult with your healthcare provider before making significant dietary changes.',
          publishedAt: '2024-01-15T11:15:00Z',
          likes: 8
        }
      ]
    },
    {
      id: '3',
      author: { name: 'Robert Martinez' },
      content: 'Great breakdown of the different food groups. The meal planning section was particularly useful.',
      publishedAt: '2024-01-15T14:20:00Z',
      likes: 6
    }
  ]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: { name: 'You' },
      content: newComment,
      publishedAt: new Date().toISOString(),
      likes: 0
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleSubmitReply = (parentId: string) => {
    if (!replyText.trim()) return;

    const reply: Comment = {
      id: Date.now().toString(),
      author: { name: 'You' },
      content: replyText,
      publishedAt: new Date().toISOString(),
      likes: 0
    };

    setComments(comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply]
        };
      }
      return comment;
    }));

    setReplyText('');
    setReplyingTo(null);
  };

  const CommentComponent: React.FC<{ comment: Comment; isReply?: boolean }> = ({ comment, isReply = false }) => (
    <div className={`${isReply ? 'ml-12' : ''} space-y-4`}>
      <div className={`rounded-lg p-4 ${
        isDark ? 'bg-gray-800' : 'bg-gray-50'
      }`}>
        <div className="flex items-start space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isDark ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            {comment.author.avatar ? (
              <img
                src={comment.author.avatar}
                alt={comment.author.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <User className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {comment.author.name}
              </span>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {formatDate(comment.publishedAt)}
              </span>
            </div>
            
            <p className={`mb-3 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {comment.content}
            </p>
            
            <div className="flex items-center space-x-4">
              <button className={`flex items-center space-x-1 text-sm transition-colors ${
                isDark 
                  ? 'text-gray-400 hover:text-red-400' 
                  : 'text-gray-600 hover:text-red-600'
              }`}>
                <Heart className="h-4 w-4" />
                <span>{comment.likes}</span>
              </button>
              
              {!isReply && (
                <button 
                  onClick={() => setReplyingTo(comment.id)}
                  className={`flex items-center space-x-1 text-sm transition-colors ${
                    isDark 
                      ? 'text-gray-400 hover:text-blue-400' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <Reply className="h-4 w-4" />
                  <span>Reply</span>
                </button>
              )}
              
              <button className={`flex items-center space-x-1 text-sm transition-colors ${
                isDark 
                  ? 'text-gray-400 hover:text-orange-400' 
                  : 'text-gray-600 hover:text-orange-600'
              }`}>
                <Flag className="h-4 w-4" />
                <span>Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reply Form */}
      {replyingTo === comment.id && (
        <div className="ml-12">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmitReply(comment.id); }}>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              rows={3}
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Reply
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.map((reply) => (
        <CommentComponent key={reply.id} comment={reply} isReply={true} />
      ))}
    </div>
  );

  return (
    <section className="mt-16">
      <div className="flex items-center space-x-3 mb-8">
        <MessageSquare className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts on this article..."
          className={`w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            isDark 
              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
          rows={4}
        />
        <div className="flex justify-between items-center mt-3">
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Please keep comments respectful and on-topic.
          </p>
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Post Comment
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentComponent key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </section>
  );
};

export default CommentSection;
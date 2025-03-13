export default function SocialMediaPage({ type = 'video' }) {
  const [socialMediaPosts, setSocialMediaPosts] = useState([
    { PostID: 1, Title: 'Post 1', Thumbnail: 'https://via.placeholder.com/360', Description: 'Description for Video 1' },
    { PostID: 2, Title: 'Post 2', Thumbnail: 'https://via.placeholder.com/360', Description: 'Description for Video 2' },
    // Add more dummy social media post data as needed
  ]);

  const headerTitle = type === 'social' ? 'Social Media' : 'Videos';

  return (
    <section className="flat-spacing-1 pt_0">
      <div className="container">
        <div className="flat-title">
          <span className="title wow fadeInUp home-title" data-wow-delay="0s">
            {headerTitle}
          </span>
        </div>
      </div>
    </section>
  );
} 
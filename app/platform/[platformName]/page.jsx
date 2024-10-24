export async function getStaticPaths() {
    const platforms = await fetch('http://localhost:3000/api/platforms'); 
    const paths = platforms.map((platform) => ({
      params: { platformName: platform.name.toLowerCase().replace(/\s+/g, '-') },
    }));
  
    return { paths, fallback: 'blocking' };
  }
  
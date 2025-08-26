import React, { useEffect } from 'react'
import Header from './HomeComponents/Header';
import '../style/Home.css'
import FeaturedContent from './HomeComponents/FeaturedContent';
import CategorySection from './HomeComponents/CategorySection';
import ReviewSection from './HomeComponents/ReviewSection';

function Home() {
  //For Title
  useEffect(()=>{
    window.scrollTo(0,0);
    document.title = "VibeMart - Home"
  },[]);
  return (
    <>
      {/* Main Content */}
      <div className='mainContent'>
        {/* Carousel */}
        <Header />

        {/* Featured Content */}
        <FeaturedContent />

        {/* Category Section */}
        <CategorySection />

        {/* Review Section */}
        <ReviewSection />
        
      </div> 
      
    </>
  )
}

export default Home
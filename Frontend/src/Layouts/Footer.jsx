import React from 'react';

function Footer() {
  return (
    <footer className='w-full bg-gray-800'>
      <div className='container mx-auto py-4 px-6 flex flex-col sm:flex-row items-center justify-between'>
        <div className='text-center sm:text-left'>
          <h2 className='text-red-600 font-bold'>© 2024 Confident Sales India Pvt Ltd</h2>
        </div>
        <div className='flex mt-4 sm:mt-0'>
          <a href="/privacy-policy" className='text-white mx-2 hover:text-red-700'>Privacy Policy</a>
          <a href="/terms-of-service" className='text-white mx-2 hover:text-red-700'>Terms of Service</a>
          <a href="/contact-us" className='text-white mx-2 hover:text-red-700'>Contact Us</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
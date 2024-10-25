import React from 'react'
import {Outlet} from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'


function Layout() {
  return (
    <div>
   
 
    <div className="flex flex-col min-h-screen">
      <header ><Header/></header>
      <Outlet/>
      <footer className="mt-auto ">
        <Footer/>
      </footer>
    </div>
  




    
    </div>
  )
}

export default Layout
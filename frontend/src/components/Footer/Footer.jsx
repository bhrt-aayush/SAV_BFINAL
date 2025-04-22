import React from 'react'
import './Footer.css'
import { assets } from '../../../public/assets/frontend_assets/assets'

function Footer() {
  return (
    <div className='footer' id='footer'>
        <div className="footer-content">
            <div className="footer-content-left">
                <img src={assets.logo} alt="" />
                <p>SavoryBites: Your ultimate destination for mouthwatering recipes, quick cooking tips, and culinary inspiration. Discover a world of flavors and elevate your dining experience with easy-to-follow guides and delicious dishes for every occasion.</p>
                <div className="footer-social-icons">
                    <img src={assets.facebook_icon} alt="" />
                    <img src={assets.twitter_icon} alt="" />
                </div>
            </div>
            <div className="footer-content-center">
                <h2>Company</h2>
                <ul>
                    <li>Home</li>
                    <li>About Us</li>
                    <li>Delivery</li>
                    <li>Privacy Policy</li>
                </ul>
            </div>
            <div className="footer-content-right">
                <h2>Get In Touch</h2>
                <ul>
                    <li>+0976818938639</li>
                    <li>savbytes@gmail.com</li>
                </ul>
            </div>
        </div>
        <hr />
        <p className="footer-copyright">Copyright 2024</p>
    </div>
  )
}

export default Footer
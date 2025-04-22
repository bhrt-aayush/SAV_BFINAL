import basket_icon from './basket_icon.png'
import logo from './logo.png'
import header_img from './header_img.png'
import search_icon from './search_icon.png'
import menu_1 from './menu_1.png'
import menu_2 from './menu_2.png'
import menu_3 from './menu_3.png'
import menu_4 from './menu_4.png'
import menu_5 from './menu_5.png'
import menu_6 from './menu_6.png'
import menu_7 from './menu_7.png'
import menu_8 from './menu_8.png'

import add_icon_white from './add_icon_white.png'
import add_icon_green from './add_icon_green.png'
import remove_icon_red from './remove_icon_red.png'
import app_store from './app_store.png'
import play_store from './play_store.png'
import linkedin_icon from './linkedin_icon.png'
import facebook_icon from './facebook_icon.png'
import twitter_icon from './twitter_icon.png'
import cross_icon from './cross_icon.png'
import selector_icon from './selector_icon.png'
import rating_starts from './rating_starts.png'
import profile_icon from './profile_icon.png'
import bag_icon from './bag_icon.png'
import logout_icon from './logout_icon.png'
import parcel_icon from './parcel_icon.png'

export const assets = {
    logo,
    basket_icon,
    header_img,
    search_icon,
    rating_starts,
    add_icon_green,
    add_icon_white,
    remove_icon_red,
    app_store,
    play_store,
    linkedin_icon,
    facebook_icon,
    twitter_icon,
    cross_icon,
    selector_icon,
    profile_icon,
    logout_icon,
    bag_icon,
    parcel_icon
}

export const menu_list = [
    {
        menu_name: "Salad",
        menu_image: menu_1
    },
    {
        menu_name: "Rolls",
        menu_image: menu_2
    },
    {
        menu_name: "Deserts",
        menu_image: menu_3
    },
    {
        menu_name: "Sandwich",
        menu_image: menu_4
    },
    {
        menu_name: "Cake",
        menu_image: menu_5
    },
    {
        menu_name: "Pure Veg",
        menu_image: menu_6
    },
    {
        menu_name: "Pasta",
        menu_image: menu_7
    },
    {
        menu_name: "Noodles",
        menu_image: menu_8
    }]


export const fetchFoods = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/food/');
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data.data; 
  } catch (error) {
    console.error('Error fetching foods:', error);
    return [];
  }
};

export const food_list = await fetchFoods();


export const fetchCategories = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/categories');
    if (!response.ok) throw new Error('Network response was not ok');
    return [await response.json()];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

/**
 *  # Explanation
 * -> This is an API connection file where we can fetch data from the server
 * -> We can fetch data from the server using the fetch() method,  the data needs to be properly formatted
 * -> The data fetched will be in JSON format (JavaScript Object Notation)
 * export const food_list = fetch('http://localhost:5000/api/food').then(res => res.json())
 * 
 * 
 */
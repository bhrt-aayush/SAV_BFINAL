import logo from './logo.png'
import add_icon from './add_icon.png'
import order_icon from './order_icon.png'
import profile_image from './profile_image.png'
import upload_area from './upload_area.png'
import parcel_icon from './parcel_icon.png'

// export const assets ={
//     logo,
//     add_icon,
//     order_icon,
//     profile_image,
//     upload_area,
//     parcel_icon
// }

export const assets = {
    logo,
    add_icon,
    order_icon,
    profile_image,
    upload_area,
    parcel_icon
}

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
import React from 'react'
import './Sidebar.css'
import { NavLink } from 'react-router-dom'
import { FaPlus, FaList, FaShoppingCart, FaUsers } from 'react-icons/fa'

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <div className="sidebar-options">
        <NavLink to='/add' className="sidebar-option">
          <FaPlus className="sidebar-icon" />
          <p>Add Items</p>
        </NavLink>
        <NavLink to='/list' className="sidebar-option">
          <FaList className="sidebar-icon" />
          <p>List Items</p>
        </NavLink>
        <NavLink to='/orders' className="sidebar-option">
          <FaShoppingCart className="sidebar-icon" />
          <p>Orders</p>
        </NavLink>
        <NavLink to='/users' className="sidebar-option">
          <FaUsers className="sidebar-icon" />
          <p>Users</p>
        </NavLink>
      </div>
    </div>
  )
}

export default Sidebar
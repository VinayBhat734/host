import React, { useState, useEffect } from 'react';
import { FaUser, FaChartLine, FaShoppingCart } from 'react-icons/fa';
import { MdProductionQuantityLimits, MdSpaceDashboard } from 'react-icons/md';
import { TbLogs } from 'react-icons/tb';
import { RxDropdownMenu } from 'react-icons/rx';
import { Button, Menu } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import '../sidebar.css';
import { LuDatabaseBackup } from "react-icons/lu";
import { SiTestcafe } from "react-icons/si";

const SideBar = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false); // New state for admin check

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
      // Check if the username is "admin"
      if (storedUsername === 'Admin') {
        setIsAdmin(true);
      }
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const items = [
    {
      key: '1',
      icon: <MdSpaceDashboard />,
      label: <Link to="/admin/dashboard">Dashboard</Link>,
    },
    {
      key: '2',
      icon: <FaUser />,
      label: 'User Data',
      children: [
        { key: '2-1', label: <Link to="/admin/view">View Data</Link> },
        { key: '2-2', label: <Link to="/admin/import">Import Data</Link> },
        { key: '2-3', label: <Link to="/admin/create">Create Data</Link> },
      ],
    },
    {
      key: '3',
      icon: <FaChartLine />,
      label: 'Sales Data',
      children: [
        { key: '3-1', label: <Link to="#view-sales-data">View Data</Link> },
        { key: '3-2', label: <Link to="#import-sales-data">Import Data</Link> },
        { key: '3-3', label: <Link to="#create-sales-data">Create Data</Link> },
      ],
    },
    {
      key: '4',
      icon: <FaShoppingCart />,
      label: 'Purchase Data',
      children: [
        { key: '4-1', label: <Link to="#view-purchase-data">View Data</Link> },
        { key: '4-2', label: <Link to="#import-purchase-data">Import Data</Link> },
        { key: '4-3', label: <Link to="#create-purchase-data">Create Data</Link> },
      ],
    },
    {
      key: '5',
      icon: <MdProductionQuantityLimits />,
      label: 'Product Data',
      children: [
        { key: '5-1', label: <Link to="#view-product-data">View Data</Link> },
        { key: '5-2', label: <Link to="#import-product-data">Import Data</Link> },
        { key: '5-3', label: <Link to="#create-product-data">Create Data</Link> },
      ],
    },
    {
      key: '6',
      icon: <TbLogs />,
      label: <Link to="/admin/logs">Logs</Link>,
    },
    {
      key: '7',
      icon: <RxDropdownMenu />,
      label: <Link to="/admin/manage-options">Manage Dropdown Options</Link>,
    },
    ...(isAdmin ? [{ // Only include if username is "admin"
      key: '8',
      icon: <LuDatabaseBackup />,
      label: <Link to="/admin/backup-restore">Backup/Restore</Link>,
    }] : []),
    { 
      key: '9',
      icon: <SiTestcafe />,
      label: <Link to="/admin/test-data">Test Data</Link>,
    }
  ];

  return (
    <div className="flex min-h-screen mt-10 mb-10">
      <div
        style={{ width: collapsed ? 80 : 200 }}
        className="bg-gray-800 text-white transition-width duration-300 rounded-e-lg"
      >
        <Button
          type="primary"
          onClick={toggleCollapsed}
          className={`m-2 ${collapsed ? 'bg-gray-700' : 'bg-gray-800'}`}
          style={{ marginBottom: 16 }}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </Button>
        <Menu
          mode="inline"
          theme="dark"
          inlineCollapsed={collapsed}
          items={items}
          className="custom-menu"
        />
      </div>
    </div>
  );
};

export default SideBar;

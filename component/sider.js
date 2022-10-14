import {
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import "antd/dist/antd.min.css";
import React, { useState } from "react";
import { NavLink as Link } from "react-router-dom";

function InitSider() {
  const items = [
    {
      key: "common",
      icon: <UserOutlined />,
      label: <Link to="/common">公共人员 </Link>,
    },
    {
      key: "project",
      icon: <VideoCameraOutlined />,
      label: <Link to="/project">项目组 </Link>,
    },
    {
        key: "holiday",
        icon: <VideoCameraOutlined />,
        label: <Link to="/holiday">设置节假日</Link>,
      },
    {
      key: "dispath",
      icon: <UploadOutlined />,
      label: <Link to="/dispatch">分配人天</Link>,
    },
    {
        key: "report",
        icon: <UploadOutlined />,
        label: <Link to="/report">生成报表</Link>,
      },
  ];
  const [selectKeys, setSelectKeys] = useState(["1"]);

  const openChange = () => {
    console.log("OpenChange");
  };
  const handleMenuClick = (e) => {
    console.log(e);
    console.log(selectKeys);
    setSelectKeys(Array.from(e.key));
  };
  return (
    <React.Fragment>
      <div className="logo" />
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={["common"]}
        items={items}
        //  selectedKeys={selectKeys}
        onSelect={(e, a, b) => handleMenuClick(e, a, b)}
        onOpenChange={() => openChange()}
      />
    </React.Fragment>
  );
}

export default InitSider;

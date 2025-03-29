import React, { useState } from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, IconButton } from "@mui/material";
import { FaChartLine, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./App.css";
import DashboardNew from "./DashboardNew";
import Dashboard241 from "./169AylıkVeri"; // ✅ Yeni bileşeni ekledik

const App = () => {
    const [activePage, setActivePage] = useState("dashboard-new");
    const [isOpen, setIsOpen] = useState(true);

    const toggleDrawer = () => {
        setIsOpen(!isOpen);
    };

    const menuItems = [
        { text: "Günlük Tedarik", icon: <FaChartLine />, page: "dashboard-new" },
        { text: "Tedarik Analiz", icon: <FaChartLine />, page: "169AylıkVeri" } // ✅ Yeni seçenek
    ];
    console.log("API URL:", process.env.REACT_APP_API_URL);


    return (
        <div className="app-container">
            <Drawer
                variant="permanent"
                className="sidebar"
                sx={{
                    width: isOpen ? 240 : 60,
                    transition: "width 0.3s",
                    "& .MuiDrawer-paper": {
                        width: isOpen ? 240 : 60,
                        overflowX: "hidden",
                        transition: "width 0.3s",
                    },
                }}
            >
                <Box display="flex" justifyContent="flex-end" alignItems="center" p={1}>
                    <IconButton onClick={toggleDrawer}>
                        {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
                    </IconButton>
                </Box>

                <List>
                    {menuItems.map((item, index) => (
                        <ListItem
                            button
                            key={index}
                            className="sidebar-item"
                            onClick={() => setActivePage(item.page)}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            {isOpen && <ListItemText primary={item.text} />}
                        </ListItem>
                    ))}
                </List>
            </Drawer>

            <Box className="content">
                {activePage === "dashboard-new" ? (
                    <DashboardNew />
                ) : activePage === "169AylıkVeri" ? (
                    <Dashboard241 />
                ) : (
                    <EmptyPage />
                )}
            </Box>
        </div>
    );
};

const EmptyPage = () => (
    <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <Typography variant="h4">Bu sayfa henüz hazırlanmadı.</Typography>
    </Box>
);

export default App;

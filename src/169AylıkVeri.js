import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    FormControl, InputLabel, Select, MenuItem, Stack,
    Typography, Card, CardContent, Button, CircularProgress, Box,
    Table, TableBody, TableCell, TableHead, TableRow, TextField
} from "@mui/material";

import {
    BarChart, LocalShipping, Commute, Loop, WarningAmber
} from "@mui/icons-material";

const MusteriSecimi = () => {
    const [projectList, setProjectList] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [timeRange, setTimeRange] = useState("1s");
    const [loading, setLoading] = useState(false);
    const [rawData, setRawData] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const timeOptions = [
        { label: "BUGÜN", value: "today" },
        { label: "DÜN", value: "yesterday" },
        { label: "3 GÜN ÖNCE", value: "3daysago" },
        { label: "1 HAFTA ÖNCE", value: "1weekago" },
        { label: "2 HAFTA ÖNCE", value: "2weeksago" },
        { label: "3 HAFTA ÖNCE", value: "3weeksago" },
        { label: "1 AY ÖNCE", value: "1monthago" }
    ];

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            try {
                const now = new Date();
                const start = new Date(now);
                const endDateObj = new Date(now);

                switch (timeRange) {
                    case "today":
                        start.setHours(0, 0, 0, 0);
                        endDateObj.setHours(23, 59, 59, 999);
                        break;
                    case "yesterday":
                        start.setDate(now.getDate() - 1);
                        start.setHours(0, 0, 0, 0);
                        endDateObj.setDate(now.getDate() - 1);
                        endDateObj.setHours(23, 59, 59, 999);
                        break;
                    case "3daysago":
                        start.setDate(now.getDate() - 3);
                        start.setHours(0, 0, 0, 0);
                        endDateObj.setDate(now.getDate() - 3);
                        endDateObj.setHours(23, 59, 59, 999);
                        break;
                    case "1weekago":
                        start.setDate(now.getDate() - 7);
                        start.setHours(0, 0, 0, 0);
                        endDateObj.setDate(now.getDate() - 7);
                        endDateObj.setHours(23, 59, 59, 999);
                        break;
                    case "2weeksago":
                        start.setDate(now.getDate() - 14);
                        start.setHours(0, 0, 0, 0);
                        endDateObj.setDate(now.getDate() - 14);
                        endDateObj.setHours(23, 59, 59, 999);
                        break;
                    case "3weeksago":
                        start.setDate(now.getDate() - 21);
                        start.setHours(0, 0, 0, 0);
                        endDateObj.setDate(now.getDate() - 21);
                        endDateObj.setHours(23, 59, 59, 999);
                        break;
                    case "1monthago":
                        start.setMonth(now.getMonth() - 1);
                        start.setHours(0, 0, 0, 0);
                        endDateObj.setMonth(now.getMonth() - 1);
                        endDateObj.setHours(23, 59, 59, 999);
                        break;
                    default:
                        start.setHours(0, 0, 0, 0);
                        endDateObj.setHours(23, 59, 59, 999);
                        break;
                }

                const startDate = start.toISOString().split(".")[0];
                const endDate = endDateObj.toISOString().split(".")[0];

                const body = { startDate, endDate, userId: 1 };
                const response = await axios.post("http://localhost:8080/proxy/tmsorders", body);
                const data = response.data.Data;

                if (!Array.isArray(data)) {
                    console.error("❌ Beklenen veri dizisi değil:", response.data);
                    return;
                }

                setRawData(data);

                const uniqueProjects = [...new Set(data.map(item => item.ProjectName).filter(Boolean))];
                setProjectList(uniqueProjects);
            } catch (error) {
                console.error("API hatası:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [timeRange, selectedProject]);




    const cardArray = [
        {
            key: "total",
            title: "TOPLAM TALEP EDİLEN",
            value: rawData.filter(order =>
                (!selectedProject || order.ProjectName === selectedProject) &&
                order.TMSVehicleRequestDocumentNo &&
                !order.TMSVehicleRequestDocumentNo.startsWith("BOS") &&
                ["YURTİÇİ FTL HİZMETLERİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.ServiceName) &&
                ["FTL HİZMETİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.SubServiceName)
            ).length,
            icon: <BarChart sx={{ fontSize: 40, color: "#ffffff" }} />,
            gradient: "linear-gradient(to right, #00c6ff, #0072ff)",
            filterFn: (data, project) =>
                data.filter(order =>
                    (!project || order.ProjectName === project) &&
                    order.TMSVehicleRequestDocumentNo &&
                    !order.TMSVehicleRequestDocumentNo.startsWith("BOS") &&
                    ["YURTİÇİ FTL HİZMETLERİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.ServiceName) &&
                    ["FTL HİZMETİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.SubServiceName)
                )
        },
        {
            key: "suppliedTotal",
            title: "TOPLAM TEDARİK EDİLEN",
            value: (() => {
                const filtered = rawData.filter(order =>
                    (!selectedProject || order.ProjectName === selectedProject) &&
                    order.TMSDespatchDocumentNo &&
                    order.TMSDespatchDocumentNo.startsWith("SFR") &&
                    (
                        (order.VehicleWorkingName === "SPOT" &&
                            order.ServiceName === "YURTİÇİ FTL HİZMETLERİ" &&
                            order.SubServiceName === "FTL HİZMETİ") ||
                        (["FİLO", "ÖZMAL", "MODERN AMBALAJ FİLO"].includes(order.VehicleWorkingName) &&
                            ["YURTİÇİ FTL HİZMETLERİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.ServiceName) &&
                            ["FTL HİZMETİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.SubServiceName))
                    )
                );
                return new Set(filtered.map(o => o.TMSDespatchDocumentNo)).size;
            })(),
            icon: <Loop sx={{ fontSize: 40, color: "#ffffff" }} />,
            gradient: "linear-gradient(to right, #43e97b, #38f9d7)",
            filterFn: (data, project) => {
                const filtered = data.filter(order =>
                    (!project || order.ProjectName === project) &&
                    order.TMSDespatchDocumentNo &&
                    order.TMSDespatchDocumentNo.startsWith("SFR") &&
                    (
                        (order.VehicleWorkingName === "SPOT" &&
                            order.ServiceName === "YURTİÇİ FTL HİZMETLERİ" &&
                            order.SubServiceName === "FTL HİZMETİ") ||
                        (["FİLO", "ÖZMAL", "MODERN AMBALAJ FİLO"].includes(order.VehicleWorkingName) &&
                            ["YURTİÇİ FTL HİZMETLERİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.ServiceName) &&
                            ["FTL HİZMETİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.SubServiceName))
                    )
                );
                const unique = new Set(filtered.map(o => o.TMSDespatchDocumentNo));
                return filtered.filter(order => unique.has(order.TMSDespatchDocumentNo));
            }
        },
        {
            key: "spot",
            title: "TEDARİK EDİLEN SPOT ARAÇLAR",
            value: (() => {
                const filtered = rawData.filter(order =>
                    (!selectedProject || order.ProjectName === selectedProject) &&
                    order.TMSDespatchDocumentNo &&
                    order.TMSDespatchDocumentNo.startsWith("SFR") &&
                    order.VehicleWorkingName === "SPOT" &&
                    order.ServiceName === "YURTİÇİ FTL HİZMETLERİ" &&
                    order.SubServiceName === "FTL HİZMETİ"
                );
                return new Set(filtered.map(o => o.TMSDespatchDocumentNo)).size;
            })(),
            icon: <LocalShipping sx={{ fontSize: 40, color: "#ffffff" }} />,
            gradient: "linear-gradient(to right, #f7971e, #ffd200)",
            filterFn: (data, project) => {
                const filtered = data.filter(order =>
                    (!project || order.ProjectName === project) &&
                    order.TMSDespatchDocumentNo &&
                    order.TMSDespatchDocumentNo.startsWith("SFR") &&
                    order.VehicleWorkingName === "SPOT" &&
                    order.ServiceName === "YURTİÇİ FTL HİZMETLERİ" &&
                    order.SubServiceName === "FTL HİZMETİ"
                );
                const unique = new Set(filtered.map(o => o.TMSDespatchDocumentNo));
                return filtered.filter(order => unique.has(order.TMSDespatchDocumentNo));
            }
        },
        {
            key: "filo",
            title: "TEDARİK EDİLEN FİLO ARAÇLAR",
            value: (() => {
                const filtered = rawData.filter(order =>
                    (!selectedProject || order.ProjectName === selectedProject) &&
                    order.TMSDespatchDocumentNo &&
                    order.TMSDespatchDocumentNo.startsWith("SFR") &&
                    ["FİLO", "ÖZMAL", "MODERN AMBALAJ FİLO"].includes(order.VehicleWorkingName) &&
                    ["YURTİÇİ FTL HİZMETLERİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.ServiceName) &&
                    ["FTL HİZMETİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.SubServiceName)
                );
                return new Set(filtered.map(o => o.TMSDespatchDocumentNo)).size;
            })(),
            icon: <Commute sx={{ fontSize: 40, color: "#ffffff" }} />,
            gradient: "linear-gradient(to right, #4facfe, #00f2fe)",
            filterFn: (data, project) => {
                const filtered = data.filter(order =>
                    (!project || order.ProjectName === project) &&
                    order.TMSDespatchDocumentNo &&
                    order.TMSDespatchDocumentNo.startsWith("SFR") &&
                    ["FİLO", "ÖZMAL", "MODERN AMBALAJ FİLO"].includes(order.VehicleWorkingName) &&
                    ["YURTİÇİ FTL HİZMETLERİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.ServiceName) &&
                    ["FTL HİZMETİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.SubServiceName)
                );
                const unique = new Set(filtered.map(o => o.TMSDespatchDocumentNo));
                return filtered.filter(order => unique.has(order.TMSDespatchDocumentNo));
            }
        },
        {
            key: "unsupplied",
            title: "TEDARİK EDİLEMEYEN",
            value: (() => {
                const all = rawData.filter(order =>
                    (!selectedProject || order.ProjectName === selectedProject) &&
                    order.TMSVehicleRequestDocumentNo &&
                    !order.TMSVehicleRequestDocumentNo.startsWith("BOS") &&
                    ["YURTİÇİ FTL HİZMETLERİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.ServiceName) &&
                    ["FTL HİZMETİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.SubServiceName)
                );
                const supplied = rawData.filter(order =>
                    (!selectedProject || order.ProjectName === selectedProject) &&
                    order.TMSDespatchDocumentNo &&
                    order.TMSDespatchDocumentNo.startsWith("SFR") &&
                    (
                        (order.VehicleWorkingName === "SPOT" &&
                            order.ServiceName === "YURTİÇİ FTL HİZMETLERİ" &&
                            order.SubServiceName === "FTL HİZMETİ") ||
                        (["FİLO", "ÖZMAL", "MODERN AMBALAJ FİLO"].includes(order.VehicleWorkingName) &&
                            ["YURTİÇİ FTL HİZMETLERİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.ServiceName) &&
                            ["FTL HİZMETİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.SubServiceName))
                    )
                );
                const suppliedSet = new Set(supplied.map(order => order.TMSVehicleRequestDocumentNo));
                return all.filter(order => !suppliedSet.has(order.TMSVehicleRequestDocumentNo)).length;
            })(),
            icon: <WarningAmber sx={{ fontSize: 40, color: "#ffffff" }} />,
            gradient: "linear-gradient(to right, #f857a6, #ff5858)",
            filterFn: (data, project) => {
                const all = data.filter(order =>
                    (!project || order.ProjectName === project) &&
                    order.TMSVehicleRequestDocumentNo &&
                    !order.TMSVehicleRequestDocumentNo.startsWith("BOS") &&
                    ["YURTİÇİ FTL HİZMETLERİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.ServiceName) &&
                    ["FTL HİZMETİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.SubServiceName)
                );
                const supplied = data.filter(order =>
                    (!project || order.ProjectName === project) &&
                    order.TMSDespatchDocumentNo &&
                    order.TMSDespatchDocumentNo.startsWith("SFR") &&
                    (
                        (order.VehicleWorkingName === "SPOT" &&
                            order.ServiceName === "YURTİÇİ FTL HİZMETLERİ" &&
                            order.SubServiceName === "FTL HİZMETİ") ||
                        (["FİLO", "ÖZMAL", "MODERN AMBALAJ FİLO"].includes(order.VehicleWorkingName) &&
                            ["YURTİÇİ FTL HİZMETLERİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.ServiceName) &&
                            ["FTL HİZMETİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.SubServiceName))
                    )
                );
                const suppliedSet = new Set(supplied.map(order => order.TMSVehicleRequestDocumentNo));
                return all.filter(order => !suppliedSet.has(order.TMSVehicleRequestDocumentNo));
            }
        }
    ];





    const calculateOnTimePercentage = () => {
        let totalRows = 0;
        let onTimeCount = 0;

        filteredOrders.forEach(order => {
            const orderDate = order.OrderDate ? new Date(order.OrderDate) : null;
            const despatchDate = order.TMSDespatchCreatedDate ? new Date(order.TMSDespatchCreatedDate) : null;

            // "-" olanlar veya boş olanlar da toplam satıra dahil edilir
            totalRows++;

            if (orderDate && despatchDate) {
                const dayDiff = Math.round((despatchDate - orderDate) / (1000 * 60 * 60 * 24));
                if (dayDiff === 0) {
                    onTimeCount++;
                }
            }
            // Else: boş veya "-" olanlar zaten zamanında sayılmaz
        });

        const percentage = totalRows > 0
            ? Math.round((onTimeCount / totalRows) * 100)
            : 0;

        return percentage;
    };




    return (
        <Box display="flex" gap={4} mt={2}>
            {/* Sol Panel */}
            <Stack spacing={3} sx={{ width: 360 }}>
                <FormControl fullWidth>
                    <InputLabel sx={{ color: "#555", fontWeight: 500 }}>Tarih Aralığı</InputLabel>
                    <Select
                        value={timeRange}
                        label="Tarih Aralığı"
                        onChange={(e) => setTimeRange(e.target.value)}
                        sx={{
                            borderRadius: 2,
                            background: "#f3f6f9",
                            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                            "& .MuiSelect-select": {
                                py: 1.5,
                                px: 2,
                                fontWeight: 500
                            }
                        }}
                    >
                        {timeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Card
                    sx={{
                        height: 1325,
                        overflowY: "auto",
                        borderRadius: 4,
                        px: 2,
                        py: 1,
                        backdropFilter: "blur(10px)",
                        background: "rgba(255,255,255,0.75)",
                        boxShadow: "0 8px 30px rgba(0,0,0,0.1)"
                    }}
                >
                    <CardContent>
                        <Typography
                            variant="h6"
                            gutterBottom
                            sx={{
                                fontWeight: 600,
                                color: "#1f1f1f",
                                textAlign: "center",
                                mb: 2
                            }}
                        >
                            🧾 Müşteri Seçimi
                        </Typography>

                        {/* Arama Kutusu */}
                        <TextField
                            placeholder="Müşteri ara..."
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ mb: 2, background: "#fff", borderRadius: 2 }}
                        />

                        {/* Seçilenleri Temizle */}
                        {selectedProject && (
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => setSelectedProject("")}
                                sx={{
                                    mb: 2,
                                    fontWeight: 500,
                                    borderRadius: 2,
                                    borderColor: "#1976d2",
                                    color: "#1976d2",
                                    "&:hover": {
                                        bgcolor: "#e3f2fd",
                                        borderColor: "#1565c0"
                                    }
                                }}
                            >
                                Seçilenleri Temizle
                            </Button>
                        )}

                        {loading ? (
                            <Stack alignItems="center" spacing={1} sx={{ mt: 4 }}>
                                <CircularProgress />
                                <Typography variant="body2" color="text.secondary">
                                    Müşteriler yükleniyor...
                                </Typography>
                            </Stack>
                        ) : (
                            <Stack spacing={1}>
                                {projectList
                                    .filter((project) =>
                                        project.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    .map((project, index) => (
                                        <Button
                                            key={index}
                                            onClick={() => {
                                                setSelectedProject(project);
                                                setSelectedCard(null);
                                                setFilteredOrders([]);
                                            }}
                                            fullWidth
                                            variant="contained"
                                            sx={{
                                                justifyContent: "flex-start",
                                                textTransform: "none",
                                                fontWeight: 500,
                                                borderRadius: 2,
                                                bgcolor:
                                                    selectedProject === project ? "#1976d2" : "#ffffff",
                                                color:
                                                    selectedProject === project ? "#ffffff" : "#333",
                                                border: "1px solid #ddd",
                                                boxShadow:
                                                    selectedProject === project
                                                        ? "0 0 12px rgba(25, 118, 210, 0.4)"
                                                        : "none",
                                                transition: "all 0.2s ease-in-out",
                                                "&:hover": {
                                                    bgcolor:
                                                        selectedProject === project ? "#1565c0" : "#f5f5f5",
                                                    transform: "scale(1.01)"
                                                }
                                            }}
                                        >
                                            {project}
                                        </Button>

                                    ))}
                            </Stack>
                        )}
                    </CardContent>
                </Card>
            </Stack>


            {/* Sağ Panel */}
            <Box flex={1}>
                {/* 📊 Kartlar yatay scroll ile */}
                <Box
                    mt={2}
                    display="flex"
                    flexWrap="nowrap"
                    overflowX="auto"
                    gap={2}
                    justifyContent="flex-start"
                    pb={1}
                >
                    {cardArray.map((card, index) => (
                        <Card
                            key={index}
                            onClick={() => {
                                setSelectedCard(card.title);
                                setFilteredOrders(card.filterFn(rawData, selectedProject));
                            }}
                            sx={{
                                cursor: "pointer",
                                minWidth: 250,
                                height: 220,
                                borderRadius: 4,
                                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                                background: card.gradient,
                                color: "#fff",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                px: 2,
                                textAlign: "center",
                                transition: "transform 0.3s ease-in-out",
                                '&:hover': { transform: 'scale(1.03)' }
                            }}
                        >
                            {card.icon}
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1 }}>
                                {card.title}
                            </Typography>
                            <Typography variant="h3" sx={{ fontWeight: 700, mt: 1 }}>
                                {card.value}
                            </Typography>
                        </Card>
                    ))}

                    {/* Her zaman görünen: ZAMANINDA OLUŞAN SEFERLER */}
                    <Card
                        sx={{
                            minWidth: 250,
                            height: 220,
                            borderRadius: 4,
                            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                            background: "linear-gradient(135deg, #4caf50, #81c784)",
                            color: "#fff",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            px: 2,
                            textAlign: "center"
                        }}
                    >
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1 }}>
                            ZAMANINDA OLUŞAN SEFERLER
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700, mt: 1 }}>
                            {calculateOnTimePercentage()}%
                        </Typography>
                    </Card>
                </Box>

                {/* 📄 Detaylı Liste */}
                {selectedCard && (
                    <Box mt={4}>
                        <Typography variant="h6" gutterBottom>
                            📄 {selectedCard} - Detaylı Liste
                        </Typography>
                        <Card
                            sx={{
                                p: 2,
                                width: "100%",
                                height: 500, // ← sabit yükseklik
                                overflow: "hidden",
                                borderRadius: 2,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                display: "flex",
                                flexDirection: "column"
                            }}
                        >
                            <Box sx={{ overflowY: "auto", flex: 1 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><strong>Proje Adı</strong></TableCell>
                                            <TableCell><strong>Yükleme Yeri</strong></TableCell>
                                            <TableCell><strong>Teslim Yeri</strong></TableCell>
                                            <TableCell><strong>Sefer No</strong></TableCell>
                                            <TableCell><strong>Sipariş Tarihi</strong></TableCell>
                                            <TableCell><strong>Sefer Tarihi</strong></TableCell>
                                            <TableCell><strong>Sefer Tarihi - Sipariş Tarihi</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredOrders.map((order, i) => {
                                            const orderDate = order.OrderDate ? new Date(order.OrderDate) : null;
                                            const despatchDate = order.TMSDespatchCreatedDate ? new Date(order.TMSDespatchCreatedDate) : null;
                                            const dayDiff = orderDate && despatchDate
                                                ? Math.round((despatchDate - orderDate) / (1000 * 60 * 60 * 24))
                                                : null;
                                            const dateDiffText = dayDiff !== null ? `${dayDiff} gün` : "-";

                                            let rowColor = "inherit";
                                            if (dayDiff === 0) rowColor = "#d4edda";
                                            else if (dayDiff === 1) rowColor = "#ffe5e5";
                                            else if (dayDiff === 2) rowColor = "#ffcccc";
                                            else if (dayDiff >= 3) {
                                                const intensity = Math.min(255, 204 - (dayDiff - 2) * 10);
                                                rowColor = `rgb(255, ${intensity}, ${intensity})`;
                                            }

                                            return (
                                                <TableRow key={i} sx={{ backgroundColor: rowColor }}>
                                                    <TableCell>{order.ProjectName}</TableCell>
                                                    <TableCell>{order.PickupCityCountyName || "-"}</TableCell>
                                                    <TableCell>{order.DeliveryCityCountyName || "-"}</TableCell>
                                                    <TableCell>{order.TMSDespatchDocumentNo || "-"}</TableCell>
                                                    <TableCell>{orderDate ? orderDate.toISOString().split("T")[0] : "-"}</TableCell>
                                                    <TableCell>{despatchDate ? despatchDate.toISOString().split("T")[0] : "-"}</TableCell>
                                                    <TableCell>{dateDiffText}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Card>

                    </Box>
                )}
            </Box>
        </Box>
    );

};

export default MusteriSecimi;

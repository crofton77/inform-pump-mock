
'use client'
import Head from 'next/head';
import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
    getKeyValue,
    Input,
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Pagination,
    Select,
    SelectItem, SharedSelection
} from "@heroui/react";
import { PencilIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useEffect, useState, useMemo } from 'react';

interface Pump {
    id: string | number;
    name?: string;
    type?: string;
    block?: string;
    latitude?: number;
    longitude?: number;
    flowRate?: number;
    offset?: number;
    currentPressure?: number;
    minPressure?: number;
    maxPressure?: number;
}

const columns = [
    {key: "name", label: "Pump Name"},
    {key: "type", label: "Type"},
    {key: "block", label: "Area/Block"},
    {key: "latitude", label: "Latitude"},
    {key: "longitude", label: "Longitude"},
    {key: "flowRate", label: "Flow Rate"},
    {key: "offset", label: "Offset"},
    {key: "currentPressure", label: "Current Pressure"},
    {key: "minPressure", label: "Min Pressure"},
    {key: "maxPressure", label: "Max Pressure"},
    {key: "actions", label: "Actions"},
];

export default function Pumps() {
    const [pumps, setPumps] = useState<Pump[]>([]);
    const [filteredPumps, setFilteredPumps] = useState<Pump[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingPump, setEditingPump] = useState<any>(null);
    const {isOpen, onOpen, onClose} = useDisclosure();
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        const fetchPumps = async () => {
            try {
                const response = await fetch('/pumps_data.json');
                if (!response.ok) {
                    throw new Error(`Failed to fetch pumps data: ${response.status}`);
                }
                const data = await response.json();
                setPumps(data);
                setFilteredPumps(data);
            } catch (error) {
                console.error("Error loading pumps data:", error);
                setPumps([]);
                setFilteredPumps([]);
            }
        };

        fetchPumps();
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredPumps(pumps);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = pumps.filter((pump: any) => {
            return (
                (pump.name && pump.name.toLowerCase().includes(query)) ||
                (pump.type && pump.type.toLowerCase().includes(query)) ||
                (pump.block && pump.block.toLowerCase().includes(query))
            );
        });

        setFilteredPumps(filtered);
        setCurrentPage(1); // Reset to first page when filtering
    }, [searchQuery, pumps]);

    const sortedPumps = useMemo(() => {
        let sortablePumps = [...filteredPumps];
        if (sortConfig !== null) {
            sortablePumps.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortablePumps;
    }, [filteredPumps, sortConfig]);

    const paginatedPumps = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedPumps.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedPumps, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(sortedPumps.length / itemsPerPage);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleEditClick = (pump: any) => {
        setEditingPump({...pump});
        onOpen();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditingPump((prev: any) => ({...prev, [name]: value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const updatedPumps = pumps.map((pump: Pump) =>
            pump.id === editingPump.id ? editingPump : pump
        );

        setPumps(updatedPumps);
        setFilteredPumps(updatedPumps);
        onClose();
    };

    const requestSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortDirection = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) {
            return null;
        }
        return sortConfig.direction;
    };

    const renderSortIcon = (columnKey: string) => {
        const direction = getSortDirection(columnKey);
        if (!direction) return null;
        return direction === 'ascending' ? (
            <ChevronUpIcon className="h-4 w-4 inline-block ml-1" />
        ) : (
            <ChevronDownIcon className="h-4 w-4 inline-block ml-1" />
        );
    };

    const renderCell = (row: any, columnKey: string) => {
        if (columnKey === "actions") {
            return (
                <Button
                    size="sm"
                    color="primary"
                    isIconOnly
                    onClick={() => handleEditClick(row)}
                    aria-label="Edit pump"
                >
                    <PencilIcon className="h-4 w-4" />
                </Button>
            );
        }
        return getKeyValue(row, columnKey);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (keys: SharedSelection) => {
        setItemsPerPage(keys.currentKey);
        setCurrentPage(1); // Reset to first page when changing items per page
    }

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <>
            <Head>
                <title>Pump Management</title>
                <meta name="description" content="Manage and monitor your pumps"/>
            </Head>

            <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
                <h1 className="text-2xl font-bold mb-6">Pump Management</h1>

                <div className="mb-6 flex justify-between items-center">
                    <Input
                        type="text"
                        placeholder="Search pumps by name, type, or area..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="max-w-md"
                    />
                    <div className="flex items-center gap-4">
                        <span className="grow shrink-0">Items per page:</span>
                        <Select
                            defaultSelectedKeys={[itemsPerPage.toString()]}
                            onSelectionChange={handleItemsPerPageChange}
                            className="grow shrink-0 basis-[70px]"
                        >
                            <SelectItem key="5">5</SelectItem>
                            <SelectItem key="10">10</SelectItem>
                            <SelectItem key="20">20</SelectItem>
                            <SelectItem key="50">50</SelectItem>
                        </Select>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        {columns.map((column) => (
                            <TableColumn
                                key={column.key}
                                onClick={() => requestSort(column.key)}
                                style={{ cursor: 'pointer' }}
                            >
                                {column.label}
                                {renderSortIcon(column.key)}
                            </TableColumn>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {paginatedPumps.map((row: any) => (
                            <TableRow key={row.id || row.key}>
                                {(columnKey) => <TableCell>{renderCell(row, columnKey as string)}</TableCell>}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {filteredPumps.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No pumps found matching your search criteria</p>
                    </div>
                )}

                <div className="flex flex-col items-center justify-center mt-4 space-y-4">
                    <p className="text-sm text-gray-500">
                        Showing {paginatedPumps.length} of {sortedPumps.length} pumps
                    </p>
                    <div className="flex items-center justify-center w-full max-w-md gap-2">
                        <Button
                            onClick={handlePreviousPage}
                            isDisabled={currentPage === 1}
                            color="primary"
                            size="sm"
                        >
                            Previous
                        </Button>
                        <Pagination
                            total={totalPages}
                            current={currentPage}
                            onChange={handlePageChange}
                        />
                        <Button
                            onClick={handleNextPage}
                            isDisabled={currentPage === totalPages}
                            color="primary"
                            size="sm"
                        >
                            Next
                        </Button>
                    </div>
                </div>

                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalContent>
                        <form onSubmit={handleSubmit}>
                            <ModalHeader>Edit Pump</ModalHeader>
                            <ModalBody>
                                {editingPump && columns.map(column => (
                                    column.key !== 'actions' && (
                                        <div key={column.key} className="mb-4">
                                            <label htmlFor={column.key} className="block text-sm font-medium text-gray-700">
                                                {column.label}
                                            </label>
                                            <Input
                                                id={column.key}
                                                name={column.key}
                                                value={editingPump[column.key] || ''}
                                                onChange={handleInputChange}
                                                className="mt-1"
                                            />
                                        </div>
                                    )
                                ))}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" type="submit">
                                    Save Changes
                                </Button>
                                <Button color="danger" onClick={onClose}>
                                    Cancel
                                </Button>
                            </ModalFooter>
                        </form>
                    </ModalContent>
                </Modal>
            </div>
        </>
    )
}

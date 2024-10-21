import { useState, useEffect } from 'react';
import stakeAbi from '../utils/stakeAbi.json';
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import Web3 from "web3";
import {
    prepareWriteContract,
    writeContract,
    waitForTransaction,
} from "@wagmi/core";

const Refral = () => {
    const webApi = new Web3("https://eth.llamarpc.com");
    const stakeC = "0xCBC2823CA0b8E2939BE0c82dd398BD07cb746E49";

    const { address } = useAccount();
    const [stakingData, setStakingData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const calculateReward = (stakedAmount, duration) => {
        console.log("stakedAmount", stakedAmount);
        console.log("duration", duration);
        let rewardPercent;
    
        if (duration == 56) {
            rewardPercent = 36;
        } else if (duration == 100) {
            rewardPercent = 72;
        } else if (duration == 180) {
            rewardPercent = 108;
        } else if (duration == 360) {
            rewardPercent = 144;
        } else {
            rewardPercent = 0;
        }
    
        return ((stakedAmount * rewardPercent * duration) / (100 * 365)).toFixed(4);
    };



    const totalPages = Math.ceil(stakingData.length / itemsPerPage);

    useEffect(() => {
        const fetchStakingData = async () => {
            if (!address) return;

            try {
                const contract = new webApi.eth.Contract(stakeAbi, stakeC);
                const stakingCount = await contract.methods.userStakingCount(address).call();
                const stakingPromises = [];

                for (let i = 0; i < stakingCount; i++) {
                    stakingPromises.push(contract.methods.userStaking(address, i).call());
                }

                const stakingEntries = await Promise.all(stakingPromises);
                setStakingData(stakingEntries);

                console.log("data", stakingEntries);
            } catch (error) {
                console.error("Error fetching staking data:", error);
            }
        };

        fetchStakingData();
    }, [address]);




    const getCurrentPageData = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return stakingData.slice(startIndex, endIndex);
    };

    const handlePageClick = (pageNumber) => {
        if (pageNumber !== "...") {
            setCurrentPage(pageNumber);
        }
    };

    const createPagination = () => {
        const pageNumbers = [];
        const visibleRange = 3;

        pageNumbers.push(1);

        if (totalPages <= visibleRange) {
            for (let i = 2; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            let startRange = Math.max(2, currentPage - 1);
            let endRange = Math.min(totalPages - 1, currentPage + 1);

            if (startRange > 2) {
                pageNumbers.push('...');
            }

            for (let i = startRange; i <= endRange; i++) {
                pageNumbers.push(i);
            }

            if (endRange < totalPages - 1) {
                pageNumbers.push('...');
            }

            if (totalPages > 1) {
                pageNumbers.push(totalPages);
            }
        }

        return pageNumbers;
    };

    const currentPageData = getCurrentPageData();

    const withdrawTrx = async (index) => {
        try {
            const withdrawTransaction = await prepareWriteContract({
                address: stakeC,
                abi: stakeAbi,
                functionName: "withdraw",
                args: [index],
                from: address,
            });

            const toastId = toast.loading("Withraw transaction...");
            const hash = await writeContract(withdrawTransaction);
            toast.loading("Withdrawing........", { id: toastId });
            await waitForTransaction(hash);
            toast.dismiss(toastId);
            toast.success("Withdraw completed successfully");
        } catch (error) {
            toast.dismiss();
            toast.error("Error in withdraw time!");
            console.error(error);
        }
    };

    return (
        <div id="ref-main" className="my-10">
            <div className="mb-4 space-x-5 px-20 tablet:px-5 tablet:space-x-2">
                <button
                    onClick={() => setCurrentPage(1)}
                    className={`px-3 py-1 ${currentPage === 1 ? 'bg-gradient' : 'bg-gray-700'} text-white rounded-3xl`}
                >
                    Staking List
                </button>
            </div>
            <div className='px-20 tablet:px-5'>
                <div className="relative overflow-x-auto shadow-md rounded-lg">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-200 uppercase bg-gray-800">
                            <tr className='font-bold text-sm tracking-wider'>
                                <th scope="col" className="px-6 py-3 text-nowrap">Sr no.</th>
                                <th scope="col" className="px-6 py-3">Amount</th>
                                <th scope="col" className="px-6 py-3">Duration</th>
                                <th scope="col" className="px-6 py-3">Returns</th>
                                <th scope="col" className="px-6 py-3">Start Date</th>
                                <th scope="col" className="px-6 py-3">End Date</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentPageData.map((row, index) => (
                                <tr key={index} className="bg-gray-950 border-b hover:bg-gray-800">
                                    <td className="px-6 py-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className="px-6 py-4 text-primary-gradient font-bold text-nowrap">{row.stakedAmount / 10 ** 18}</td>
                                    <td className="px-4 py-4">
                                        <span className='bg-gradient text-white px-6 py-1 rounded-3xl text-nowrap'>{row.stakingDuration} days</span>
                                    </td>
                                    {/* <td className="px-6 py-4">{((row.stakedAmount * row.stakingDuration *36  / (365 * 100)) / 10 ** 18 ).toFixed(4)}</td> */}
                                    <td className="px-6 py-4">
                                        {calculateReward(row.stakedAmount / 10**18, row.stakingDuration)}
                                    </td>
                                    <td className="px-6 py-4">{formatDate(row.startDate)}</td>
                                    <td className="px-6 py-4">{formatDate(row.stakingEndTime)}</td>
                                    {/* <td className="px-6 py-4">
                                        <button className={`${row.status ? "active:scale-[0.9] transition-all ease-in-out" : ""}`}
                                        onClick={() => withdrawTrx(index)}>
                                            <span className={`${row.status ? "bg-green-500" : "bg-gray-500"} text-white font-bold px-3 py-1 rounded-2xl`}>
                                                {row.status ? "Withdraw" : "Locked"}
                                            </span>
                                        </button>
                                    </td> */}

                                    <td className="px-6 py-4">
                                        <button className={`${calculateReward(row.stakedAmount / 10 ** 18, row.stakingDuration, row.stakingEndTime).status ? "active:scale-[0.9] transition-all ease-in-out" : ""}`}
                                            onClick={() => calculateReward(row.stakedAmount / 10 ** 18, row.stakingDuration, row.stakingEndTime).status && withdrawTrx(index)}>
                                            <span className={`${calculateReward(row.stakedAmount / 10 ** 18, row.stakingDuration, row.stakingEndTime).status ? "bg-green-500" : "bg-gray-500"} text-white font-bold px-3 py-1 rounded-2xl`}>
                                                {calculateReward(row.stakedAmount / 10 ** 18, row.stakingDuration, row.stakingEndTime).status ? "Withdraw" : "Locked"}
                                            </span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <nav className="flex gap-2 items-center justify-end pt-4" aria-label="Table navigation">
                    <button
                        onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                        className="px-3 h-8 text-primary-gradient font-bold bg-gray-700 border-gray-600 rounded hover:text-white hover:bg-gray-600"
                        disabled={currentPage <= 1}
                    >
                        {"<<"}
                    </button>

                    <div className="inline-flex space-x-2 text-sm">
                        {createPagination().map((page, index) => (
                            <button
                                key={index}
                                onClick={() => handlePageClick(page)}
                                className={`px-3 h-8 border font-bold border-gray-600 rounded ${currentPage === page ? 'bg-gray-500 text-primary-gradient font-bold' : 'bg-gray-700 text-primary-gradient font-bold hover:text-white hover:bg-gray-600'}`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                        className="px-3 h-8 text-primary-gradient font-bold bg-gray-700 border-gray-600 rounded hover:text-white hover:bg-gray-600"
                        disabled={currentPage >= totalPages}
                    >
                        {">>"}
                    </button>
                </nav>
            </div>
        </div>
    );
};

export default Refral;

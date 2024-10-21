

import st from "../../assets/icons/safe tick.webp"
import rcoin from "../../assets/voip_logo (1)/icon2.png"

import duration from "../../assets/icons/duration.svg"
import returns from "../../assets/icons/returns.svg"
import { useEffect, useRef, useState } from "react"
import stakeAbi from '../utils/stakeAbi.json'
import tAbi from '../utils/tAbi.json';
// import TokenModal from "../utils/TokenModal";
// import { list } from "../utils/tokenlist";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import Web3 from "web3";
import {
    prepareWriteContract,
    writeContract,
    waitForTransaction,
} from "@wagmi/core";

const isValid = (regex) => (input) => regex.test(input);
const numberRegex = /^\d*\.?\d*$/;
const isValidNumber = isValid(numberRegex);

const Hero = () => {

    const webApi = new Web3("https://eth.llamarpc.com");

    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(0);
    const [voipTokenCount, setvoipTokenCount] = useState("");
    const [APTpercentage, setAPTpercentage] = useState();
    const [voipApproveToken, setvoipApproveToken] = useState();
    const [userStakeAmount, setUserStakeAmount] = useState(0);
    const [userReward, setUserReward] = useState(0);
    const [totalStake, setTotalStake] = useState(0);
    const [totalStaker, setTotalStaker] = useState(0);
    const [ApprovedDone, setApprovedDone] = useState(false);
    const [ApprovedDones, setApprovedDones] = useState(false);

    const { isConnected, address } = useAccount();
    const stakeC = "0xCBC2823CA0b8E2939BE0c82dd398BD07cb746E49";
    const tAddress = "0xf3d74182247eF963E0De37E3F2e174E98dCBfAE1";
    const [durationValue, setDurationValue] = useState("");

    const [data1, setData1] = useState({
        approveAmt: ""
    });

    const [data, setData] = useState({
        amt: ""
    });

    console.log("Address", address)



    const [allowance, setAllowance] = useState(0);

    useEffect(() => {
        const fetchAllowance = async () => {
            try {
                const tContract = new webApi.eth.Contract(
                    tAbi,
                    tAddress
                );
                const allowanceAmount = await tContract.methods
                    .allowance(address, stakeC)
                    .call();
                setAllowance(allowanceAmount);
            } catch (error) {
                console.error("Error fetching allowance:", error);
            }
        };
        console.log("fetch allowance", allowance);
        fetchAllowance();
    }, [address, stakeC]);


    useEffect(() => {
        const fetchData = async () => {
            if (!address) return;

            try {
                const contract = new webApi.eth.Contract(stakeAbi, stakeC);
                // Fetch user-specific data
                const userStakeData = await contract.methods.totalInvestedAmount(address).call();
                const userRewardData = await contract.methods.totalRewardsReceived(address).call();

                // Fetch global data
                const totalStakeData = await contract.methods.totalStaked().call();
                const totalStakerData = await contract.methods.userCountInThePlatform().call();

                setUserStakeAmount(userStakeData);
                setUserReward(userRewardData);
                setTotalStake(totalStakeData);
                setTotalStaker(totalStakerData);
            } catch (error) {
                console.error("Error fetching data from contract:", error);
            }
        };

        fetchData();
    }, [address]);
    console.log("userStakeAmount", userStakeAmount);
    console.log("userReward", userReward);
    console.log("totalStake", totalStake);
    console.log("totalStaker", totalStaker);

    const approveTrx = async () => {
        try {
            let amtValue = webApi.utils.toWei(data1.approveAmt.toString());
            const usdtAmt = amtValue * 10 ** 18;
            const stakeAmt = Number(usdtAmt);
            const approvalTransaction = await prepareWriteContract({
                address: tAddress,
                abi: tAbi,
                functionName: "approve",
                args: [stakeC, stakeAmt],
                from: address,
            });

            const toastId = toast.loading("Approving transaction...");
            const hash = await writeContract(approvalTransaction);
            toast.loading("Processing Approval Transaction..", { id: toastId });
            await waitForTransaction(hash);
            toast.dismiss(toastId);
            toast.success("Approval completed successfully");
            setApprovedDone(true);
        } catch (error) {
            toast.dismiss();
            toast.error("Something went wrong with the transaction!");
            console.error(error);
        }
    };

    const stakeToken = async () => {

        try {
            let amtValue = webApi.utils.toWei(data.amt.toString());
            const usdtAmt = amtValue;
            const stakeAmt = Number(usdtAmt);
            const buyTransaction = await prepareWriteContract({
                address: stakeC,
                abi: stakeAbi,
                functionName: "stakeTokens",
                args: [stakeAmt, durationValue],
                from: address,
            });

            const toastId = toast.loading("Processing Buy Transaction..");
            await writeContract(buyTransaction);

            toast.success("Stake Transaction completed successfully", { id: toastId });
            setData({ amt: "", duration: "" });

            setTimeout(() => {
                window.location.reload();
            }, 3000);

        } catch (error) {
            toast.dismiss();
            toast.error("Something went wrong with the transaction!");
            console.error(error);
        }
    };




    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleItemClick = (item, APYper) => {
        setDurationValue(item);
        setSelectedItem(item);
        setAPTpercentage(APYper)
        setIsOpen(false);
    };
    let reward = !isNaN(data.amt) && selectedItem !== 0 ? (APTpercentage) * data.amt * durationValue / (365 * 100) : "";

    return (
        <>
            <div id="hero-main" className=" relative min-h-[90vh]  flex items-center bg-[url('/bgimg/bgimg1.svg')] bg-  bg-cover bg-center px-3 z-0 py-10  mx-5 phone:mx-2 my-10 rounded-[40px]   ">
                <div
                    className="absolute z-[-1] blur-3xl inset-0 h-full bg-black opacity-30 rounded-[40px]"
                ></div>

                <div className="h-full   w-full flex laptop:flex-col items-center justify-center ">

                    <div id="hero-left"
                        className="     w-[55%] h-[100%] flex flex-col justify-center  gap-10 desktop:w-[100%]    "
                    >
                        <div id="hero-left-top" className="  flex flex-col gap-5">

                            <h1 className=" text-[70px] font-bold relative leading-tight laptop:text-center desktop:text-[60px]  desktop:laptop:text-[50px]  desktop:laptop:phone:text-[30px]    ">

                                Bag Daily Cash, Earn Upto 18% a Year!

                            </h1>

                            <p className=" flex leading-snug font-normal    text-[17px] w-[80%] tracking-[0.35px] desktop:w-[90%] laptop:text-center  laptop:m-auto desktop:phone:w-[100%]    ">
                                Get in on the action with Voip Token. Cash in rewards every second with top-tier slashing protection. {"Let's"} make your crypto work while you chill.

                            </p>
                        </div>
                    </div>

                    <div
                        id="hero-right"
                        className=" text-white relative z-10 laptop:mt-10 w-[40%] h-[100%] flex justify-center gap-0  desktop:w-[100%] "
                    >



                        {/* {
                            rightContainer ?
                                <div id="hero-right-container"
                                    className=" flex   flex-col py-6 justify-center gap-5        w-[500px] max-w-[600px] overflow-hidden rounded-[20px]   bg-cover bg-opacity-80 bg-center  px-5"
                                >
                                    <h1>Step 01</h1>


                                    <div className="flex items-center  justify-between phone:flex-col-reverse" >
                                        <h2 className=" text-4xl text-white  font-bold">Approve Tokens</h2>
                                        <div className="flex items-center  justify-center gap-2 bg-gray-100   px-3 py-1 h-fit  rounded-lg w-fit" >
                                            <img loading="lazy" src={st} alt="" />
                                            <p className=" text-black text-nowrap text-sm " >Safe & secured</p>
                                        </div>
                                    </div>
                                    <p className=" tablet:text-center text-white " >Approve Voip  Token and start to stake.</p>

                                    <div>
                                        <div className="relative mb-6">
                                            <div className=" absolute inset-y-0 start-0 mx-3 flex items-center   pointer-events-none">
                                                <img loading="lazy" src={rcoin} className="h-[30px]  w-[30px] " alt="" />
                                            </div>

                                            <input type="number" id="input-group-1" className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg  block w-full px-14 py-4 " placeholder=" Voip Token Amount "
                                                value={voipApproveToken}
                                                onChange={(event) => event.target.value <= 0 ? setvoipApproveToken("") : setvoipApproveToken(parseFloat(event.target.value))}

                                            />

                                        </div>


                                        <div className="flex justify-center" >

                                            <button type="submit" onClick={() => handlerightContainer()} className=" btn2 text-white   px-5 py-2 rounded-xl     ">
                                                Approve Token
                                            </button>
                                        </div>

                                    </div>




                                </div>
                                : */}
                        <div id="hero-right-container"
                            className=" flex   flex-col py-5 justify-center gap-5     min-h-[570px]  w-[500px] max-w-[600px] overflow-hidden rounded-[20px]   bg-cover bg-opacity-80 bg-center  px-6"
                        >


                            <div className=" space-y-2" >

                                <div className="flex items-center   justify-between phone:flex-col-reverse phone:gap-3 " >
                                    <h2 className=" text-4xl font-bold phone:text-center phone:text-3xl ">Stake Voip Token </h2>
                                    <div className="flex items-center  justify-center gap-2 bg-gray-100   px-3 py-1 h-fit  rounded-lg w-fit" >
                                        <img loading="lazy" src={st} alt="" />
                                        <p className=" text-black  text-sm text-nowrap" >Safe & secured</p>
                                    </div>
                                </div>
                                <p className=" tablet:text-center max-w-[18rem] leading-tight " >Cash in, with $VOIP Token. Secure, easy, and profitable, just the way you like it.</p>
                            </div>

                            <div>
                                
                                    <div className="relative mb-6">
                                        <div className="absolute inset-y-0 start-0 mx-3 flex items-center pointer-events-none">
                                            <img loading="lazy" src={rcoin} className="h-[30px] w-[30px]" alt="" />
                                        </div>
                                        <input
                                            type="number"
                                            id="input-group-1"
                                            className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg block w-full px-14 py-4"
                                            placeholder="Approve Token"
                                            value={data1.approveAmt}
                                            onChange={(e) => {
                                                const val = e.target.value.split("").filter((el) => !isNaN(el)).join("");
                                                setData1({
                                                    ...data1,
                                                    approveAmt: val,
                                                });
                                            }}
                                        />
                                        <button
                                            id="dropdownDefaultButton"
                                            onClick={approveTrx}
                                            className={`absolute inset-y-0 end-0 px-3 mx-3 my-3 rounded-lg text-sm flex items-center ${ApprovedDone ? "bg-green-500" : "bg-gray-500"}`}
                                            type="button"
                                        >
                                            {`${allowance > 0 ? "Approved" : "Approve"}`}
                                        </button>
                                    </div>
                                

                                <div className="relative mb-6">
                                    <div className=" absolute inset-y-0 start-0 mx-3 flex items-center   pointer-events-none">
                                        <img loading="lazy" src={rcoin} className="h-[30px]  w-[30px] " alt="" />
                                    </div>

                                    <input type="number" id="input-group-2" className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg  block w-full px-14 py-4 " placeholder=" Voip Token Amount  "
                                        value={data.amt}
                                        onChange={(e) => {
                                            const val = e.target.value
                                                .split("")
                                                .filter((el) => isValidNumber(el))
                                                .join("");
                                            setData({
                                                ...data,
                                                amt: val,
                                            });
                                        }}
                                    />

                                </div>
                                <div className="relative mb-6">
                                    <div className=" opacity-[0.5] absolute inset-y-0 start-0 mx-3 flex items-center   pointer-events-none">
                                        <img loading="lazy" src={duration} className="h-[30px]  w-[30px] " alt="" />
                                    </div>

                                    <input type="text" id="input-group-3" className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg  block w-full px-14 py-4         " placeholder=" Duration " value={selectedItem ? `${selectedItem} Days` : ""} disabled />


                                    <div ref={dropdownRef} className="  " >
                                        <button

                                            id="dropdownDefaultButton"
                                            onClick={toggleDropdown}
                                            className="absolute inset-y-0 end-0 px-5 mx-3 my-2 rounded-lg flex items-center  text-black   bg-gray-300  "
                                            type="button"
                                        >
                                            <svg className="w-2.5 h-2.5  " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m1 1 4 4 4-4" />
                                            </svg>


                                        </button>
                                        {/* Dropdown menu */}
                                        {isOpen && (
                                            <div
                                                id="dropdown"
                                                className="z-10   absolute right-0  border-[#c143e1]  border-[2px] divide-y divide-gray-100 rounded-lg shadow w-44  bg-gray-800"
                                            >
                                                <ul className="  text-sm text-gray-200" aria-labelledby="dropdownDefaultButton">
                                                    <li className=" border-b-[#c143e1] border-b-[1px] " >
                                                        <button
                                                            onClick={() => handleItemClick(56, 36)}
                                                            className="block w-full px-4 py-2    hover:bg-gray-600  hover:text-white"
                                                        >
                                                            56 Days
                                                        </button>
                                                    </li>
                                                    <li className=" border-b-[#c143e1] border-b-[1px] ">
                                                        <button
                                                            onClick={() => handleItemClick(100, 72)}
                                                            className="block w-full px-4 py-2 hover:bg-gray-600 dark:hover:bg-gray-600 dark:hover:text-white"
                                                        >
                                                            100 Days
                                                        </button>
                                                    </li>
                                                    <li className=" border-b-[#c143e1] border-b-[1px] ">
                                                        <button
                                                            onClick={() => handleItemClick(180, 108)}
                                                            className="block w-full px-4 py-2 hover:bg-gray-600 dark:hover:bg-gray-600 dark:hover:text-white"
                                                        >
                                                            180 Days
                                                        </button>
                                                    </li>
                                                    <li >
                                                        <button
                                                            onClick={() => handleItemClick(360, 144)}
                                                            className="block w-full px-4 py-2 hover:bg-gray-600 dark:hover:bg-gray-600 dark:hover:text-white"
                                                        >
                                                            360 Days
                                                        </button>
                                                    </li>

                                                </ul>
                                            </div>
                                        )}
                                    </div>




                                </div>

                                <div className="relative mb-6">
                                    <div className=" absolute opacity-[0.5] inset-y-0 start-0 mx-3 flex items-center   pointer-events-none">
                                        <img loading="lazy" src={returns} className="h-[30px]  w-[30px] " alt="" />
                                    </div>

                                    <input type="text" id="input-group-3" className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg  block w-full px-14 py-4         "
                                        value={reward} placeholder=" Returns " disabled />

                                </div>

                                <div className="flex justify-center" >

                                    <button type="submit" className=" btn2   text-white px-5 py-2 rounded-xl   "
                                        onClick={stakeToken}>
                                        Stake Now
                                    </button>
                                </div>

                            </div>
                            <div className="flex  flex-col gap-2" >
                                {/* <div className="flex justify-between" >
                                    <p className="text-white" >Total Receive</p>
                                    <p>0.0 Voip Token </p>
                                </div> */}
                                {/* <div className="flex justify-between" >
                                    <p className="text-white" >Returns</p>
                                    <p>21% Monthly</p>
                                </div> */}
                                {/* <div className="flex justify-between" >
                                    <p className="text-white" >Token Price</p>
                                    <p>$2.2869</p>
                                </div> */}
                                {/* <div className="flex justify-between" >
                                            <p className="text-white" >Referral</p>
                                            <p>Nan</p>
                                        </div> */}
                            </div>



                        </div>

                        {/* } */}

                    </div>
                </div>


            </div>

            <div className=" px-14 py-2 w-full laptop:px-10 laptop:tablet:px-2    " >
                <div id="banner-inner" className="  rounded-[10px] flex  p-5 gap-10 laptop:tablet:gap-5 flex-wrap justify-evenly">
                    <div id="banner-card" className="flex gap-2 flex-col items-center justify-center" >
                        <h5 className="text-xl text-white " >User Stake Amount</h5>
                        <p className="text-4xl laptop:text-3xl laptop:tablet:text-2xl laptop:tablet:phone:text-2xl font-bold text-primary-gradient" >{userStakeAmount / 10 ** 18}</p>
                    </div>

                    <div className="w-[3px] h-24 tablet:hidden bg-gradient-to-b from-transparent via-gray-200    via-50% to-transparent" />



                    <div id="banner-card" className="flex gap-2 flex-col items-center justify-center" >
                        <h5 className="text-xl text-white " >User Total Reward</h5>
                        <p className="text-4xl laptop:text-3xl laptop:tablet:text-2xl laptop:tablet:phone:text-2xl font-bold text-primary-gradient" >{userReward}</p>
                    </div>

                    <div className="w-[3px] h-24 tablet:hidden bg-gradient-to-b from-transparent via-gray-200    via-50% to-transparent" />

                    <div id="banner-card" className="flex gap-2 flex-col items-center justify-center" >
                        <h5 className="text-xl text-white " >Total Staked</h5>
                        <p className="text-4xl laptop:text-3xl laptop:tablet:text-2xl laptop:tablet:phone:text-2xl font-bold text-primary-gradient" >{totalStake / 10 ** 18}</p>
                    </div>

                    <div className="w-[3px] h-24 tablet:hidden bg-gradient-to-b from-transparent via-gray-200    via-50% to-transparent" />

                    <div id="banner-card" className="flex gap-2 flex-col items-center justify-center" >
                        <h5 className="text-xl text-white " >Total Staker</h5>
                        <p className="text-4xl laptop:text-3xl laptop:tablet:text-2xl laptop:tablet:phone:text-2xl font-bold text-primary-gradient" >{totalStaker}</p>
                    </div>

                </div>
            </div>
        </>
    )
}
export default Hero
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../../layout";
import { IoIosArrowBack } from "react-icons/io";
import Modal from "../../../../lib/modal";
import DateTimePicker from "react-datetime-picker";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import { streamDestinations } from "../../../../utils/streamDestinations";
import LivestreamCard from "../../../../lib/components/LivestreamCard";
import {
  FetchProjectById,
  sendPeerInvite,
} from "../../../../network/projects/projects";
import { IoAddSharp } from "react-icons/io5";
import { FaRegTrashCan } from "react-icons/fa6";
import { Select } from "antd";
import { StateContext } from "../../../../context";
import { CiCalendar } from "react-icons/ci";
import {
  createLiveStream,
  fetchAllStreams,
} from "../../../../network/streams/streams-api";

const ProjectPage = () => {
  const { id: projectId } = useParams(); // Extract projectId from the route params
  const [activeTab, setActiveTab] = useState("upcoming"); // Manage active tab state
  const [modalOpen, setModalOpen] = useState(false);
  const [PeerInviteModalOpen, setPeerInviteModalOpen] = useState(false);
  let navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState("");
  const [ProjectData, setProjectData] = useState<null | any>(null);
  const [userData, setUserData] = useState<
    { role: "co-Host" | "Subscriber"; userId: string }[]
  >([]);
  const [inputEmail, setInputEmail] = useState("");
  const [projectingLoading, setProjectLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"co-Host" | "Subscriber">(
    "co-Host"
  );
  const [loading, setLoading] = useState(false);
  type ValuePiece = Date | null;
  type Value = ValuePiece | [ValuePiece, ValuePiece];
  const [value, onChange] = useState<Value>(new Date());
  const [streamData, setStreamData] = useState<{
    title: string;
    description: string;
  }>({ title: "", description: "" });

  const { livestreamData, setCurrentStream, setLiveStreamData } =
    useContext(StateContext);

  const getAllStreams = async () => {
    try {
      const res = await fetchAllStreams(projectId!);
      console.log(res);
      setLiveStreamData(res?.result);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    getAllStreams();
  }, []);

  const rolesOption: { label: string; value: "co-Host" | "Subscriber" }[] = [
    { label: "Co-host", value: "co-Host" },
    { label: "subscriber", value: "Subscriber" },
  ];

  const handlegetProjectDetails = async () => {
    setProjectLoading(true);
    try {
      const res = await FetchProjectById(projectId!);
      console.log(res);
      setProjectData(res?.results);
    } catch (err) {
      console.log(err);
    }
    setProjectLoading(false);
  };

  useEffect(() => {
    handlegetProjectDetails();
  }, []);

  const handleChange = (event: any) => {
    setSelectedOption(event.target.value);
  };

  const validateEmail = (email: string) => {
    // Simple email validation using regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAddEmail = async (e: any) => {
    e.preventDefault();
    console.log(selectedRole);

    if (inputEmail && userData.length < 3 && validateEmail(inputEmail)) {
      setUserData([...userData, { role: selectedRole, userId: inputEmail }]);
      setInputEmail("");
    }
  };

  const onSubmit = async () => {
    setLoading(true);
    try {
      const res = await sendPeerInvite(projectId!, { users: userData });
      console.log(res);
      setLoading(false);
      setPeerInviteModalOpen(false);
      toast.success("Project added successfully");
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
    setUserData([]);
  };

  const handleDeleteEmail = (emailToDelete: string) => {
    setUserData(userData.filter((user) => user.userId !== emailToDelete));
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleCreateLiveStream = async () => {
    try {
      const res = await createLiveStream(projectId!, {
        title: streamData.title,
        description: streamData.description,
      });
      console.log(res);
      setCurrentStream(res?.results);
      // window.open("/stream")
      setModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Layout>
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleCreateLiveStream}
        children={
          <div>
            <label className="inline-flex items-center mb-2">
              <input
                type="radio"
                name="options"
                value="instant"
                checked={selectedOption === "instant"}
                onChange={handleChange}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-[14px]">
                {" "}
                Start instant livestream
              </span>
            </label>

            <label className="inline-flex items-center mb-2 ml-4">
              <input
                type="radio"
                name="options"
                value="schedule"
                checked={selectedOption === "schedule"}
                onChange={handleChange}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-[14px]">
                Schedule livestream for later
              </span>
            </label>

            {/* {selectedOption !== "" && (
              <div>
                <p className="mb-1">Add destinations</p>
                {streamDestinations.map((destination) => (
                  <div className="flex items-center cursor-pointer gap-1 mb-1">
                    <span>{destination.icon}</span>
                    <p className="text-[14px]">{destination.name}</p>
                  </div>
                ))}
              </div>
            )} */}

            {selectedOption !== "" && (
              <>
                <div className="mt-2">
                  <label htmlFor="">Title</label>
                  <input
                    type="text"
                    onChange={(e) =>
                      setStreamData({ ...streamData, title: e.target.value })
                    }
                    className="w-full h-12 mt-2 border border-gray-600 rounded-md p-4"
                  />
                </div>
                <div className="mt-2">
                  <label htmlFor="">Description</label>
                  <textarea
                    name=""
                    rows={4}
                    id=""
                    onChange={(e) =>
                      setStreamData({
                        ...streamData,
                        description: e.target.value,
                      })
                    }
                    className="w-full mt-2 border border-gray-600 rounded-md p-4"
                  ></textarea>
                </div>
              </>
            )}

            {selectedOption == "schedule" && (
              <div className="flex flex-col gap-2 mt-4">
                <p>Select a date and time</p>
                <DateTimePicker onChange={onChange} value={value} />
              </div>
            )}
          </div>
        }
        title="Create Livestream"
      />
      <Modal
        isOpen={PeerInviteModalOpen}
        onClose={() => setPeerInviteModalOpen(false)}
        children={
          <div>
            <form onSubmit={handleAddEmail} className="relative">
              <label htmlFor="email-input" className="block mb-2">
                Invite users via email
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="email-input"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  className="flex-grow border border-gray-600 rounded-md py-2 pl-3 pr-[150px] mr-2 focus:outline-none focus:border-gray-800"
                  placeholder="Enter email"
                  disabled={userData.length >= 3}
                />
                <button
                  type="submit"
                  className="bg-orange-500 text-primary-white py-2 px-4 rounded-md disabled:bg-gray-400"
                  disabled={!inputEmail || !validateEmail(inputEmail)}
                >
                  Add
                </button>
                <div className="absolute right-[74px] top-19 h-[41px] w-36">
                  <Select
                    options={rolesOption}
                    placeholder="Select user role"
                    className="h-full border-gray-600 rounded-md hover:border-gray-800 focus:outline-none focus:border-gray-800 w-full"
                    onChange={(e) => setSelectedRole(e)}
                  />
                </div>
              </div>
              {userData.length >= 3 && (
                <p className="text-red-500 text-sm mt-1">
                  You can only add up to 3 emails.
                </p>
              )}
            </form>

            <div className="mt-4">
              {userData.map((user, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border-b py-2"
                >
                  <span className="text-[14px]">{`${user.userId} (${user.role})`}</span>
                  <button
                    onClick={() => handleDeleteEmail(user.userId)}
                    className="text-orange-500 hover:text-orange-700 font-bold"
                  >
                    <FaRegTrashCan />
                  </button>
                </div>
              ))}
            </div>
            {userData.length > 0 && (
              <div>
                <button
                  className="bg-orange-500 text-primary-white px-4 py-2 rounded"
                  onClick={onSubmit}
                >
                  {loading ? (
                    <div className="grid place-content-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#FFFFFF]"></div>
                    </div>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            )}
          </div>
        }
        title="Invite Peers"
      />
      <div
        onClick={() => navigate(-1)}
        className="flex gap-2 px-4 py-2 cursor-pointer items-center text-white"
      >
        <IoIosArrowBack />
        Back
      </div>
      {projectingLoading ? (
        <div className="grid place-content-center h-[calc(100vh-400px)]">
          <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-[#FFFFFF]"></div>
        </div>
      ) : (
        <div className="container p-4">
          <h1 className="text-2xl text-white font-bold mb-1">
            {ProjectData?.title}
          </h1>
          <p className="text-md text-primary-white font-[400] mb-6 max-w-[45rem]">
            {ProjectData?.description}
          </p>

          <div className="mb-6 flex flex-wrap-reverse gap-4 justify-between items-center w-full">
            <div className="flex rounded-lg overflow-hidden border border-primary-border">
              <button
                className={`lg:px-4 px-2 text-[14px] lg:text-[16px] py-1 lg:py-2 ${
                  activeTab !== "upcoming"
                    ? "bg-dark-gray text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
                onClick={() => setActiveTab("upcoming")}
              >
                Upcoming Livestreams
              </button>
              <button
                className={`lg:px-4 px-2 py-1 lg:py-2 ${
                  activeTab !== "past"
                    ? "bg-dark-gray text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
                onClick={() => setActiveTab("past")}
              >
                Past Livestreams
              </button>
            </div>

            <div>
              <button
                className="bg-dark-gray text-white px-4 py-2 rounded hover:bg-dark-gray border border-primary-border text-[14px] transition"
                onClick={() => setModalOpen(true)}
              >
                Create New Livestream
              </button>
            </div>
          </div>

          {activeTab === "upcoming" ? (
            <div>
              {livestreamData?.length === 0 ? (
                <div className="text-primary-white grid place-content-center w-full h-[calc(100vh-400px)] gap-4">
                  <div className="border border-primary-border w-ful flex justify-center flex-col items-center gap-4 rounded-lg py-16 border-dashed px-36">
                    <div className=""></div>
                    <CiCalendar size={40} />
                    <p>Scheduled streams will appear here.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full gap-6">
                  {livestreamData
                    ?.filter(
                      (item: any) =>
                        item?.status.toLocaleLowerCase() !== "ended"
                    )
                    ?.map((livestream: any) => (
                      <LivestreamCard livestream={livestream} />
                    ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {livestreamData?.length === 0 ? (
                <div className="text-primary-white grid place-content-center w-full h-[calc(100vh-400px)] gap-4 ">
                  <div className="border border-primary-border w-ful flex justify-center flex-col items-center gap-4 rounded-lg py-16 border-dashed px-36">
                    <div className=""></div>
                    <CiCalendar size={40} />
                    <p>Completed streams will appear here.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full gap-6">
                  {livestreamData
                    ?.map((livestream: any) => (
                      <LivestreamCard livestream={livestream} />
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <div className="px-4 mt-4">
        <button
          onClick={() => setPeerInviteModalOpen(true)}
          className="bg-dark-gray flex items-center gap-1 text-white px-4 py-2 rounded hover:bg-dark-gray border border-primary-border text-[14px] transition"
        >
          <IoAddSharp size={18} /> Invite Peer
        </button>
      </div>
    </Layout>
  );
};

export default ProjectPage;
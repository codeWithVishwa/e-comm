import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaEye,
  FaArchive,
  FaReply,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Axios from "../../utils/Axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SummaryApi from "../../common/SummaryApi";

const AdminMsg = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getMessage,
        url: `${SummaryApi.getMessage.url}?page=${pagination.page}&limit=${
          pagination.limit
        }${statusFilter !== "all" ? `&status=${statusFilter}` : ""}${
          searchTerm ? `&search=${searchTerm}` : ""
        }`,
      });

      setMessages(response.data.data);
      setPagination({
        ...pagination,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
      console.error("Fetch messages error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [pagination.page, statusFilter, searchTerm]);

  const handleStatusChange = async (messageId, newStatus) => {
    try {
      await Axios({
        ...SummaryApi.updateMessageStatus,
        url: SummaryApi.updateMessageStatus.url.replace(
          ":messageId",
          messageId
        ),
        data: { status: newStatus },
      });
      fetchMessages();
      toast.success("Message status updated");
      if (currentMessage?._id === messageId) {
        setCurrentMessage({ ...currentMessage, status: newStatus });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
      console.error("Update status error:", error);
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await Axios({
        url: SummaryApi.deleteMessage.url.replace(":messageId", messageId),
        method: SummaryApi.deleteMessage.method,
      });
      fetchMessages();
      if (currentMessage?._id === messageId) {
        setCurrentMessage(null);
      }
      toast.success("Message deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
      console.error("Delete message error:", error);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gray-900 mx-auto px-4 py-8">
      <div className="mt-16 ">
        <h1 className="text-3xl font-bold mb-8 text-indigo-300">
          Message Management
        </h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Message List */}
          <div
            className={`lg:w-1/2 ${
              currentMessage ? "hidden lg:block" : "w-full"
            }`}
          >
            <div className="bg-gray-800 rounded-lg shadow-md p-4 border border-gray-700">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search messages..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700 text-white border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPagination({ ...pagination, page: 1 });
                    }}
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
                <select
                  className="rounded-lg px-4 py-2 bg-gray-700 text-white border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPagination({ ...pagination, page: 1 });
                  }}
                >
                  <option value="all" className="bg-gray-800">
                    All Messages
                  </option>
                  <option value="unread" className="bg-gray-800">
                    Unread
                  </option>
                  <option value="read" className="bg-gray-800">
                    Read
                  </option>
                  <option value="archived" className="bg-gray-800">
                    Archived
                  </option>
                </select>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <p className="text-center py-8 text-gray-400">
                  No messages found
                </p>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`p-4 rounded-lg cursor-pointer transition-all border ${
                        message.status === "unread"
                          ? "bg-gray-900 border-indigo-500"
                          : "bg-gray-800 border-gray-700"
                      } ${
                        currentMessage?._id === message._id
                          ? "ring-2 ring-indigo-500"
                          : "hover:bg-gray-700"
                      }`}
                      onClick={() => setCurrentMessage(message)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-white">
                            {message.subject}
                          </h3>
                          <p className="text-sm text-gray-300">
                            {message.name} &lt;{message.email}&gt;
                          </p>
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDate(message.createdAt)}
                          {message.status === "unread" && (
                            <span className="ml-2 inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                          )}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-400 line-clamp-2">
                        {message.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {messages.length > 0 && (
                <div className="flex justify-between items-center mt-6 text-white">
                  <button
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        page: Math.max(1, pagination.page - 1),
                      })
                    }
                    disabled={pagination.page === 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 border border-gray-600"
                  >
                    <FaChevronLeft /> Previous
                  </button>
                  <span className="text-gray-300">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        page: Math.min(
                          pagination.totalPages,
                          pagination.page + 1
                        ),
                      })
                    }
                    disabled={pagination.page === pagination.totalPages}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 border border-gray-600"
                  >
                    Next <FaChevronRight />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Message Detail View */}
          {currentMessage ? (
            <div className="lg:w-1/2 w-full">
              <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-white">
                    {currentMessage.subject}
                  </h2>
                  <button
                    onClick={() => setCurrentMessage(null)}
                    className="lg:hidden text-gray-400 hover:text-white"
                  >
                    &times;
                  </button>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="font-medium text-white">
                      {currentMessage.name}
                    </p>
                    <p className="text-gray-400">{currentMessage.email}</p>
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatDate(currentMessage.createdAt)}
                  </div>
                </div>

                <div className="bg-gray-900 p-4 rounded-lg mb-6 border border-gray-700">
                  <p className="whitespace-pre-line text-gray-300">
                    {currentMessage.message}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {currentMessage.status !== "read" && (
                    <button
                      onClick={() =>
                        handleStatusChange(currentMessage._id, "read")
                      }
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-blue-100"
                    >
                      <FaEye /> Mark as Read
                    </button>
                  )}
                  {currentMessage.status !== "archived" && (
                    <button
                      onClick={() =>
                        handleStatusChange(currentMessage._id, "archived")
                      }
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-900 hover:bg-yellow-800 text-yellow-100"
                    >
                      <FaArchive /> Archive
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleStatusChange(currentMessage._id, "read");

                      const subject = `Re: ${currentMessage.subject}`;
                      const body = `\n\n-------- Original Message --------\n${currentMessage.message}`;

                      // Gmail compose URL
                      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                        currentMessage.email
                      )}&su=${encodeURIComponent(
                        subject
                      )}&body=${encodeURIComponent(body)}`;

                      window.open(gmailUrl, "_blank");
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-900 hover:bg-green-800 text-green-100"
                  >
                    <FaReply /> Reply
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this message?"
                        )
                      ) {
                        handleDelete(currentMessage._id);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-900 hover:bg-red-800 text-red-100"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:w-1/2 w-full flex items-center justify-center bg-gray-800 rounded-lg shadow-md p-8 border border-gray-700">
              <p className="text-gray-400 text-center">
                Select a message to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMsg;

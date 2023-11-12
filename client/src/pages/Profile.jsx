import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import {
  updateFailure,
  updateUserStart,
  updateUserSuccess,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signInFailure,
  signInStart,
  signInSuccess,
  signOutUserFailure,
  signOutUserSuccess,
  signOutUserStart,
} from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
const Profile = () => {
  const [showError, setShowError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const filRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileLoadError, setFileLoadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    console.log(currentUser._id);
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",

      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileLoadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downlaodURL) => {
          setFormData({ ...formData, avatar: downlaodURL });
        });
      }
    );
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
    console.log(formData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());

      const res = await fetch(`api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("hi after dispatch");

      if (data.success === false) {
        dispatch(updateFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));

        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOutUser = async () => {
    dispatch(signOutUserStart());

    try {
      const res = await fetch(`api/auth/signout`);
      const data = await res.json();

      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));

        return;
      }
      console.log("Signout here " + currentUser.username);
      dispatch(signOutUserSuccess(data));
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  const handleShowListing = async () => {
    try {
      setShowError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        setShowError(true);
        return;
      }

      setUserListings(data);
    } catch (error) {
      setShowError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }

      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7 ">Profile</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          hidden
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          type="file"
          ref={filRef}
        />

        <img
          onClick={() => filRef.current.click()}
          src={formData.avatar || currentUser.avatar}
          alt="profile"
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
        />
        <p className="self-center text-sm">
          {fileLoadError ? (
            <>
              <span className="text-red-700">
                {" "}
                Error Image upload (Image must be less than 2mb)
              </span>
            </>
          ) : filePerc > 0 && filePerc < 100 ? (
            <>
              <span className="text-slate-700">{`Uploading ${filePerc}%`}</span>
            </>
          ) : filePerc == 100 ? (
            <>
              <span className="text-green-700">Successfully uploaded!</span>
            </>
          ) : (
            " "
          )}
        </p>

        <input
          type="text"
          placeholder="username"
          defaultValue={currentUser.username}
          onChange={handleChange}
          className="border p-3 rounded-lg"
          id="username"
        />

        <input
          type="email"
          placeholder="email"
          onChange={handleChange}
          defaultValue={currentUser.email}
          className="border p-3 rounded-lg"
          id="email"
        />

        <input
          type="password"
          placeholder="password"
          onChange={handleChange}
          className="border p-3 rounded-lg"
          id="password"
        />

        <button
          disabled={loading}
          className="bg-slate-700 text-white rounded-lg p-3 
          uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "loading..." : "Update"}
        </button>
        <Link
          to={"/create-listing"}
          className="bg-green-700
        rounded-lg uppercase text-center hover:opacity-95 text-white p-3 "
        >
          Create Listing
        </Link>
      </form>

      <div className="flex justify-between mt-5">
        <span
          onClick={handleDeleteUser}
          className="text-red-700 cursor-pointer"
        >
          Delete account
        </span>

        <span
          onClick={handleSignOutUser}
          className="text-red-700 cursor-pointer"
        >
          Sign out
        </span>
      </div>

      <p className="text-red-700 mt-5">{error ? error : ""}</p>

      <p className="text-green-700 mt-5">
        {updateSuccess ? "User is updated succfully! " : ""}
      </p>

      <button onClick={handleShowListing} className="text-green-700 w-full">
        Show Listing
      </button>

      <p className="text-red-700 mt-5">{showError ? showError : ""}</p>

      {userListings && userListings.length > 0 && (
        <div className="flex flex-col gap-4">
          <h1 className="text-center mt-7 text-2xl font-semibold">
            Your Listings
          </h1>
          {userListings.map((listing) => (
            <div
              key={listing._id}
              className="border rounded-lg p-3 flex justify-between items-center gap-4"
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imageUrls[0]}
                  alt="listing cover"
                  className="h-16 w-16 object-contain"
                />
              </Link>
              <Link
                className="text-slate-700 font-semibold  hover:underline truncate flex-1"
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
              </Link>

              <div className="flex flex-col item-center">
                <button
                  onClick={() => handleListingDelete(listing._id)}
                  className="text-red-700 uppercase"
                >
                  Delete
                </button>
                <Link to={`/update-listing/${listing._id}`}>
                  <button className="text-green-700 uppercase">Edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;

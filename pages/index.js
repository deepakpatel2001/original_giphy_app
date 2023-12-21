import { useState, useEffect } from "react";
import { auth } from "../firebase/firebaseConfig";
import { useRouter } from "next/router";
import Login from "@/components/auth/Login";
import SignUp from "@/components/auth/SignUp";
import GifSearch from "../components/GifSearch";
import styles from "./index.module.css";
import { sendEmailVerification } from "firebase/auth";

const IndexPage = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState("login");
  const [accountNotFound, setAccountNotFound] = useState(false);
  const [invalidCredential, setInvalidCredential] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        if (user.emailVerified) {
          // User is authenticated and email is verified, navigate to GifSearch
          router.push("/");
        } else {
          // Email is not verified, send a verification email
          sendVerificationEmail();
          setEmailVerificationSent(true);
        }
      }
    });

    return () => unsubscribe();
  }, [emailVerificationSent]);

  const sendVerificationEmail = async () => {
    try {
      await sendEmailVerification(auth.currentUser);
      console.log("Verification email sent");
      // You can display a message to the user instructing them to verify their email
    } catch (error) {
      console.error("Error sending verification email", error.message);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      {!auth.currentUser ? (
        <div className={styles.loginSignUp}>
          <div className={styles.loginDetails}>
            {currentPage === "login" && (
              <>
                {accountNotFound && (
                  <p className={styles.errorMessage}>
                    Account not found. Please create an account.
                  </p>
                )}
                {invalidCredential && (
                  <p className={styles.errorMessage}>
                    Invalid credentials. Please check your email and password.
                  </p>
                )}

                {emailVerificationSent && (
                  <p className={styles.message}>
                    Verification email sent. Please check your email and click
                    on the verification link. After verification, please log in
                    for your security.
                  </p>
                )}
                <Login
                  setAccountNotFound={setAccountNotFound}
                  setInvalidCredential={setInvalidCredential}
                />
                <div>
                  <button onClick={() => handlePageChange("signup")}>
                    Create your account
                  </button>
                </div>
              </>
            )}
          </div>

          <div className={styles.signupDetails}>
            {currentPage === "signup" && (
              <>
                {accountNotFound && (
                  <p className={styles.errorMessage}>
                    Email already in use. Please use a different email.
                  </p>
                )}
                {invalidCredential && (
                  <p className={styles.errorMessage}>
                    Invalid credentials. Please check your email and password.
                  </p>
                )}
                <SignUp
                  setAccountNotFound={setAccountNotFound}
                  setInvalidCredential={setInvalidCredential}
                />
                <div>
                  <button onClick={() => handlePageChange("login")}>
                    Login
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <GifSearch />
      )}
    </div>
  );
};

export default IndexPage;
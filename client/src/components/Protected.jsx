import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {  useNavigate } from 'react-router-dom';

export default function Protected({ children, authentication = false,redirectPath = '/' }) {
  const navigate = useNavigate();
  const [loader, setLoader] = useState(true);
  const authStatus = useSelector(state => state.auth.status);

  useEffect(() => {
    // For protected routes (authentication = true)
    if (authentication && !authStatus) {
      navigate('/login', { replace: true });
      return;
    }

    // For public only routes (authentication = false)
    if (!authentication && authStatus) {
      navigate(redirectPath, { replace: true });
      return;
    }

    setLoader(false);
  }, [authStatus, navigate, authentication, redirectPath]);
  

  return loader ? <h1>Loading...</h1> : <> {children} </>;
}

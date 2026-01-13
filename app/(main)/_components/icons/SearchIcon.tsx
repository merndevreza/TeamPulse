import React from "react";

const SearchIcon = ({ className }: { className?: string }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="23" height="23" viewBox="0 0 19 19" fill="none">
      <path d="M7.75 0C3.46979 0 0 3.46979 0 7.75C0 12.0302 3.46979 15.5 7.75 15.5C9.62001 15.5 11.3353 14.8377 12.6742 13.7348L17.2197 18.2803C17.5126 18.5732 17.9874 18.5732 18.2803 18.2803C18.5732 17.9874 18.5732 17.5126 18.2803 17.2197L13.7348 12.6742C14.8377 11.3353 15.5 9.62001 15.5 7.75C15.5 3.46979 12.0302 0 7.75 0Z" fill="#6D6B6B" />
    </svg>
  );
};

export default SearchIcon;

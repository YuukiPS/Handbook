import React, { useState } from "react";

interface CollapseProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  children: React.ReactNode;
}

const Collapse = React.forwardRef<HTMLDivElement, CollapseProps>(
  ({ children, title, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => {
      setIsOpen(!isOpen);
    };

    return (
      <div {...props} ref={ref}>
        <div className="flex justify-center">
          <button
            type="button"
            className="mt-2 rounded-md px-4 py-2"
            onClick={handleToggle}
          >
            {title}
          </button>
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isOpen ? "max-h-screen" : "max-h-0"
          }`}
        >
          <div className="overflow-hidden rounded-md border">{children}</div>
        </div>
      </div>
    );
  }
);

// const Collapse = React.forwardRef<HTMLDivElement, CollapseProps>(({
//     children,
//     title,
//     buttonProps,
//     contentProps,
//     ...props
// })) => {
//     const [isOpen, setIsOpen] = useState(false);

//     const handleToggle = () => {
//         setIsOpen(!isOpen);
//     };

//     return (
//         <div {...props}>
//             <button
//                 className='mt-2 rounded-md px-4 py-2'
//                 onClick={handleToggle}
//                 {...buttonProps}
//             >
//                 {title}
//             </button>
//             <div
//                 className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-screen' : 'max-h-0'}`}
//                 {...contentProps}
//             >
//                 <div className='overflow-hidden rounded-md border'>
//                     {children}
//                 </div>
//             </div>
//         </div>
//     );
// };

export default Collapse;

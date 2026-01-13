import navigator from "@/utils/navigator";
import NavItem from "./NavItem";

const Navigation = async () => {
  const { navigationItems } = await navigator();

  return (
    <nav className="border-b border-light-grey-2" aria-label="Main Navigation ">
      {navigationItems.map((item, index) => (
        <NavItem item={item} key={index} />
      ))}
    </nav>
  );
};

export default Navigation;

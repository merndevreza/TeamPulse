import { DotCategory, OtherUser, UserForAdmin } from "@/app/actions/api/types";
import React, { useEffect } from "react";

const useSearch = ({
  inputRef,
  data,
  type,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  data: DotCategory[] | OtherUser[] | UserForAdmin[];
  type: "dots" | "users" | "admin_users";
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [results, setResults] = React.useState<
    DotCategory[] | OtherUser[] | UserForAdmin[]
  >([]);
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  // attach input listener once, cleanup on unmount
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    const onInput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      setSearchTerm(target.value);
    };

    el.addEventListener("input", onInput);
    return () => {
      el.removeEventListener("input", onInput);
    };
  }, [inputRef]);

  // debounce + filter
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (!data) return;

      const term = searchTerm.trim().toLowerCase();

      if (type === "dots") {
        const dots = data as DotCategory[];

        if (term === "") {
          setResults(dots);
          return;
        }

        // keep ONLY labels that match; drop categories with 0 matches
        const filtered = dots
          .map((category) => ({
            ...category,
            labels: category.labels.filter((lbl) =>
              lbl.label.toLowerCase().includes(term)
            ),
          }))
          .filter((category) => category.labels.length > 0);

        setResults(filtered);
      } else if (type === "admin_users") {
        const users = data as UserForAdmin[];

        if (term === "") {
          setResults(users);
          return;
        }

        const filtered = users.filter((u) => {
          const fullName = `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim();
          return (
            fullName.toLowerCase().includes(term)
          );
        });

        setResults(filtered);
      } else {
        const users = data as OtherUser[];

        if (term === "") {
          setResults(users);
          return;
        }

        const filtered = users.filter((u) => {
          const fullName = `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim();
          return (
            fullName.toLowerCase().includes(term)
          );
        });

        setResults(filtered);
      }
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm, data, type]);

  return { results };
};

export default useSearch;

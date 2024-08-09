import { memo } from "react";
import i18n from "@/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";

const LanguageSwitcher: React.FC = memo(() => {
  const language = [
    {
      id: "en",
      name: "English",
    },
    {
      id: "id",
      name: "Indonesia",
    },
    {
      id: "ja",
      name: "Japan",
    },
    {
      id: "zh",
      name: "Chinese",
    },
    {
      id: "ru",
      name: "Russian",
    },
    {
      id: "th",
      name: "Thai",
    },
  ];

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <Select onValueChange={changeLanguage} defaultValue={i18n.language}>
      <SelectTrigger>
        <SelectValue placeholder={"Select Language"} />
      </SelectTrigger>
      <SelectContent>
        {language.map((language) => (
          <SelectItem value={language.id} key={language.id}>
            {language.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

export default LanguageSwitcher;

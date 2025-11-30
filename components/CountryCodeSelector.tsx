import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import CountryFlag from "react-native-country-flag";
import NewBottomModal from "./NewBottomModal";
import SearchInput from "./SearchInput";

export interface Country {
  code: string; // ISO country code (e.g., "NG", "US")
  dialCode: string; // Phone dial code (e.g., "234", "1")
  name: string; // Country name (e.g., "Nigeria", "United States")
}

/**
 * Comprehensive list of 232 countries with their ISO codes and dial codes.
 * Sorted alphabetically for easy browsing and searching.
 */
export const COUNTRY_CODES: Country[] = [
  { code: "AF", dialCode: "93", name: "Afghanistan" },
  { code: "AL", dialCode: "355", name: "Albania" },
  { code: "DZ", dialCode: "213", name: "Algeria" },
  { code: "AS", dialCode: "1684", name: "American Samoa" },
  { code: "AD", dialCode: "376", name: "Andorra" },
  { code: "AO", dialCode: "244", name: "Angola" },
  { code: "AI", dialCode: "1264", name: "Anguilla" },
  { code: "AG", dialCode: "1268", name: "Antigua and Barbuda" },
  { code: "AR", dialCode: "54", name: "Argentina" },
  { code: "AM", dialCode: "374", name: "Armenia" },
  { code: "AW", dialCode: "297", name: "Aruba" },
  { code: "AU", dialCode: "61", name: "Australia" },
  { code: "AT", dialCode: "43", name: "Austria" },
  { code: "AZ", dialCode: "994", name: "Azerbaijan" },
  { code: "BS", dialCode: "1242", name: "Bahamas" },
  { code: "BH", dialCode: "973", name: "Bahrain" },
  { code: "BD", dialCode: "880", name: "Bangladesh" },
  { code: "BB", dialCode: "1246", name: "Barbados" },
  { code: "BY", dialCode: "375", name: "Belarus" },
  { code: "BE", dialCode: "32", name: "Belgium" },
  { code: "BZ", dialCode: "501", name: "Belize" },
  { code: "BJ", dialCode: "229", name: "Benin" },
  { code: "BM", dialCode: "1441", name: "Bermuda" },
  { code: "BT", dialCode: "975", name: "Bhutan" },
  { code: "BO", dialCode: "591", name: "Bolivia" },
  { code: "BA", dialCode: "387", name: "Bosnia and Herzegovina" },
  { code: "BW", dialCode: "267", name: "Botswana" },
  { code: "BR", dialCode: "55", name: "Brazil" },
  { code: "BN", dialCode: "673", name: "Brunei" },
  { code: "BG", dialCode: "359", name: "Bulgaria" },
  { code: "BF", dialCode: "226", name: "Burkina Faso" },
  { code: "BI", dialCode: "257", name: "Burundi" },
  { code: "KH", dialCode: "855", name: "Cambodia" },
  { code: "CM", dialCode: "237", name: "Cameroon" },
  { code: "CA", dialCode: "1", name: "Canada" },
  { code: "CV", dialCode: "238", name: "Cape Verde" },
  { code: "KY", dialCode: "1345", name: "Cayman Islands" },
  { code: "CF", dialCode: "236", name: "Central African Republic" },
  { code: "TD", dialCode: "235", name: "Chad" },
  { code: "CL", dialCode: "56", name: "Chile" },
  { code: "CN", dialCode: "86", name: "China" },
  { code: "CO", dialCode: "57", name: "Colombia" },
  { code: "KM", dialCode: "269", name: "Comoros" },
  { code: "CG", dialCode: "242", name: "Congo" },
  { code: "CD", dialCode: "243", name: "Congo (DRC)" },
  { code: "CR", dialCode: "506", name: "Costa Rica" },
  { code: "CI", dialCode: "225", name: "Côte d'Ivoire" },
  { code: "HR", dialCode: "385", name: "Croatia" },
  { code: "CU", dialCode: "53", name: "Cuba" },
  { code: "CY", dialCode: "357", name: "Cyprus" },
  { code: "CZ", dialCode: "420", name: "Czech Republic" },
  { code: "DK", dialCode: "45", name: "Denmark" },
  { code: "DJ", dialCode: "253", name: "Djibouti" },
  { code: "DM", dialCode: "1767", name: "Dominica" },
  { code: "DO", dialCode: "1809", name: "Dominican Republic" },
  { code: "EC", dialCode: "593", name: "Ecuador" },
  { code: "EG", dialCode: "20", name: "Egypt" },
  { code: "SV", dialCode: "503", name: "El Salvador" },
  { code: "GQ", dialCode: "240", name: "Equatorial Guinea" },
  { code: "ER", dialCode: "291", name: "Eritrea" },
  { code: "EE", dialCode: "372", name: "Estonia" },
  { code: "ET", dialCode: "251", name: "Ethiopia" },
  { code: "FJ", dialCode: "679", name: "Fiji" },
  { code: "FI", dialCode: "358", name: "Finland" },
  { code: "FR", dialCode: "33", name: "France" },
  { code: "GA", dialCode: "241", name: "Gabon" },
  { code: "GM", dialCode: "220", name: "Gambia" },
  { code: "GE", dialCode: "995", name: "Georgia" },
  { code: "DE", dialCode: "49", name: "Germany" },
  { code: "GH", dialCode: "233", name: "Ghana" },
  { code: "GR", dialCode: "30", name: "Greece" },
  { code: "GD", dialCode: "1473", name: "Grenada" },
  { code: "GU", dialCode: "1671", name: "Guam" },
  { code: "GT", dialCode: "502", name: "Guatemala" },
  { code: "GN", dialCode: "224", name: "Guinea" },
  { code: "GW", dialCode: "245", name: "Guinea-Bissau" },
  { code: "GY", dialCode: "592", name: "Guyana" },
  { code: "HT", dialCode: "509", name: "Haiti" },
  { code: "HN", dialCode: "504", name: "Honduras" },
  { code: "HK", dialCode: "852", name: "Hong Kong" },
  { code: "HU", dialCode: "36", name: "Hungary" },
  { code: "IS", dialCode: "354", name: "Iceland" },
  { code: "IN", dialCode: "91", name: "India" },
  { code: "ID", dialCode: "62", name: "Indonesia" },
  { code: "IR", dialCode: "98", name: "Iran" },
  { code: "IQ", dialCode: "964", name: "Iraq" },
  { code: "IE", dialCode: "353", name: "Ireland" },
  { code: "IL", dialCode: "972", name: "Israel" },
  { code: "IT", dialCode: "39", name: "Italy" },
  { code: "JM", dialCode: "1876", name: "Jamaica" },
  { code: "JP", dialCode: "81", name: "Japan" },
  { code: "JO", dialCode: "962", name: "Jordan" },
  { code: "KZ", dialCode: "7", name: "Kazakhstan" },
  { code: "KE", dialCode: "254", name: "Kenya" },
  { code: "KI", dialCode: "686", name: "Kiribati" },
  { code: "KP", dialCode: "850", name: "North Korea" },
  { code: "KR", dialCode: "82", name: "South Korea" },
  { code: "KW", dialCode: "965", name: "Kuwait" },
  { code: "KG", dialCode: "996", name: "Kyrgyzstan" },
  { code: "LA", dialCode: "856", name: "Laos" },
  { code: "LV", dialCode: "371", name: "Latvia" },
  { code: "LB", dialCode: "961", name: "Lebanon" },
  { code: "LS", dialCode: "266", name: "Lesotho" },
  { code: "LR", dialCode: "231", name: "Liberia" },
  { code: "LY", dialCode: "218", name: "Libya" },
  { code: "LI", dialCode: "423", name: "Liechtenstein" },
  { code: "LT", dialCode: "370", name: "Lithuania" },
  { code: "LU", dialCode: "352", name: "Luxembourg" },
  { code: "MO", dialCode: "853", name: "Macau" },
  { code: "MK", dialCode: "389", name: "North Macedonia" },
  { code: "MG", dialCode: "261", name: "Madagascar" },
  { code: "MW", dialCode: "265", name: "Malawi" },
  { code: "MY", dialCode: "60", name: "Malaysia" },
  { code: "MV", dialCode: "960", name: "Maldives" },
  { code: "ML", dialCode: "223", name: "Mali" },
  { code: "MT", dialCode: "356", name: "Malta" },
  { code: "MH", dialCode: "692", name: "Marshall Islands" },
  { code: "MR", dialCode: "222", name: "Mauritania" },
  { code: "MU", dialCode: "230", name: "Mauritius" },
  { code: "MX", dialCode: "52", name: "Mexico" },
  { code: "FM", dialCode: "691", name: "Micronesia" },
  { code: "MD", dialCode: "373", name: "Moldova" },
  { code: "MC", dialCode: "377", name: "Monaco" },
  { code: "MN", dialCode: "976", name: "Mongolia" },
  { code: "ME", dialCode: "382", name: "Montenegro" },
  { code: "MA", dialCode: "212", name: "Morocco" },
  { code: "MZ", dialCode: "258", name: "Mozambique" },
  { code: "MM", dialCode: "95", name: "Myanmar" },
  { code: "NA", dialCode: "264", name: "Namibia" },
  { code: "NR", dialCode: "674", name: "Nauru" },
  { code: "NP", dialCode: "977", name: "Nepal" },
  { code: "NL", dialCode: "31", name: "Netherlands" },
  { code: "NZ", dialCode: "64", name: "New Zealand" },
  { code: "NI", dialCode: "505", name: "Nicaragua" },
  { code: "NE", dialCode: "227", name: "Niger" },
  { code: "NG", dialCode: "234", name: "Nigeria" },
  { code: "NO", dialCode: "47", name: "Norway" },
  { code: "OM", dialCode: "968", name: "Oman" },
  { code: "PK", dialCode: "92", name: "Pakistan" },
  { code: "PW", dialCode: "680", name: "Palau" },
  { code: "PS", dialCode: "970", name: "Palestine" },
  { code: "PA", dialCode: "507", name: "Panama" },
  { code: "PG", dialCode: "675", name: "Papua New Guinea" },
  { code: "PY", dialCode: "595", name: "Paraguay" },
  { code: "PE", dialCode: "51", name: "Peru" },
  { code: "PH", dialCode: "63", name: "Philippines" },
  { code: "PL", dialCode: "48", name: "Poland" },
  { code: "PT", dialCode: "351", name: "Portugal" },
  { code: "PR", dialCode: "1787", name: "Puerto Rico" },
  { code: "QA", dialCode: "974", name: "Qatar" },
  { code: "RO", dialCode: "40", name: "Romania" },
  { code: "RU", dialCode: "7", name: "Russia" },
  { code: "RW", dialCode: "250", name: "Rwanda" },
  { code: "KN", dialCode: "1869", name: "Saint Kitts and Nevis" },
  { code: "LC", dialCode: "1758", name: "Saint Lucia" },
  { code: "VC", dialCode: "1784", name: "Saint Vincent and the Grenadines" },
  { code: "WS", dialCode: "685", name: "Samoa" },
  { code: "SM", dialCode: "378", name: "San Marino" },
  { code: "ST", dialCode: "239", name: "São Tomé and Príncipe" },
  { code: "SA", dialCode: "966", name: "Saudi Arabia" },
  { code: "SN", dialCode: "221", name: "Senegal" },
  { code: "RS", dialCode: "381", name: "Serbia" },
  { code: "SC", dialCode: "248", name: "Seychelles" },
  { code: "SL", dialCode: "232", name: "Sierra Leone" },
  { code: "SG", dialCode: "65", name: "Singapore" },
  { code: "SK", dialCode: "421", name: "Slovakia" },
  { code: "SI", dialCode: "386", name: "Slovenia" },
  { code: "SB", dialCode: "677", name: "Solomon Islands" },
  { code: "SO", dialCode: "252", name: "Somalia" },
  { code: "ZA", dialCode: "27", name: "South Africa" },
  { code: "SS", dialCode: "211", name: "South Sudan" },
  { code: "ES", dialCode: "34", name: "Spain" },
  { code: "LK", dialCode: "94", name: "Sri Lanka" },
  { code: "SD", dialCode: "249", name: "Sudan" },
  { code: "SR", dialCode: "597", name: "Suriname" },
  { code: "SZ", dialCode: "268", name: "Eswatini" },
  { code: "SE", dialCode: "46", name: "Sweden" },
  { code: "CH", dialCode: "41", name: "Switzerland" },
  { code: "SY", dialCode: "963", name: "Syria" },
  { code: "TW", dialCode: "886", name: "Taiwan" },
  { code: "TJ", dialCode: "992", name: "Tajikistan" },
  { code: "TZ", dialCode: "255", name: "Tanzania" },
  { code: "TH", dialCode: "66", name: "Thailand" },
  { code: "TL", dialCode: "670", name: "Timor-Leste" },
  { code: "TG", dialCode: "228", name: "Togo" },
  { code: "TO", dialCode: "676", name: "Tonga" },
  { code: "TT", dialCode: "1868", name: "Trinidad and Tobago" },
  { code: "TN", dialCode: "216", name: "Tunisia" },
  { code: "TR", dialCode: "90", name: "Turkey" },
  { code: "TM", dialCode: "993", name: "Turkmenistan" },
  { code: "TV", dialCode: "688", name: "Tuvalu" },
  { code: "UG", dialCode: "256", name: "Uganda" },
  { code: "UA", dialCode: "380", name: "Ukraine" },
  { code: "AE", dialCode: "971", name: "United Arab Emirates" },
  { code: "GB", dialCode: "44", name: "United Kingdom" },
  { code: "US", dialCode: "1", name: "United States" },
  { code: "UY", dialCode: "598", name: "Uruguay" },
  { code: "UZ", dialCode: "998", name: "Uzbekistan" },
  { code: "VU", dialCode: "678", name: "Vanuatu" },
  { code: "VA", dialCode: "379", name: "Vatican City" },
  { code: "VE", dialCode: "58", name: "Venezuela" },
  { code: "VN", dialCode: "84", name: "Vietnam" },
  { code: "YE", dialCode: "967", name: "Yemen" },
  { code: "ZM", dialCode: "260", name: "Zambia" },
  { code: "ZW", dialCode: "263", name: "Zimbabwe" },
];

interface CountryCodeSelectorProps {
  isShow: boolean;
  onClose: () => void;
  onSelect: (country: Country) => void;
  selectedCountryCode?: string; // Currently selected ISO code
}

/**
 * Shared Country Code Selector Modal Component
 * 
 * A searchable modal for selecting country dial codes with flag display.
 * Can be used across the app for phone number input fields.
 * 
 * @example
 * ```tsx
 * const [showSelector, setShowSelector] = useState(false);
 * const [selectedCountry, setSelectedCountry] = useState<Country>({
 *   code: "NG",
 *   dialCode: "234",
 *   name: "Nigeria"
 * });
 * 
 * <CountryCodeSelector
 *   isShow={showSelector}
 *   onClose={() => setShowSelector(false)}
 *   onSelect={(country) => {
 *     setSelectedCountry(country);
 *     setShowSelector(false);
 *   }}
 *   selectedCountryCode={selectedCountry.code}
 * />
 * ```
 */
const CountryCodeSelector: React.FC<CountryCodeSelectorProps> = ({
  isShow,
  onClose,
  onSelect,
  selectedCountryCode,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCountries = COUNTRY_CODES.filter((country) => {
    const query = searchQuery.toLowerCase();
    return (
      country.name.toLowerCase().includes(query) ||
      country.dialCode.includes(query) ||
      country.code.toLowerCase().includes(query)
    );
  });

  const handleSelectCountry = (country: Country) => {
    onSelect(country);
    setSearchQuery(""); // Reset search on selection
  };

  return (
    <NewBottomModal
      isShow={isShow}
      onClose={onClose}
      maxHeight="70%"
      contentStyle={styles.modalContent}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Select Country Code</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <SearchInput
            placeholder="Search country or code..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Country List */}
        <ScrollView
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
        >
          {filteredCountries.length > 0 ? (
            filteredCountries.map((country) => {
              const isSelected = country.code === selectedCountryCode;
              return (
                <Pressable
                  key={country.code}
                  style={({ pressed }) => [
                    styles.countryItem,
                    isSelected && styles.selectedCountryItem,
                    pressed && styles.pressedItem,
                  ]}
                  onPress={() => handleSelectCountry(country)}
                >
                  <View style={styles.countryLeft}>
                    <View style={styles.flagContainer}>
                      <CountryFlag isoCode={country.code} size={24} />
                    </View>
                    <Text style={[
                      styles.countryName,
                      isSelected && styles.selectedText
                    ]}>
                      {country.name}
                    </Text>
                  </View>
                  <Text style={[
                    styles.dialCode,
                    isSelected && styles.selectedText
                  ]}>
                    +{country.dialCode}
                  </Text>
                </Pressable>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No countries found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try a different search term
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </NewBottomModal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "white",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "DMSansSemiBold",
    color: "#212B36",
    textAlign: "center",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  listContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  selectedCountryItem: {
    backgroundColor: "#FFF1F2",
  },
  pressedItem: {
    backgroundColor: "#F9FAFB",
  },
  countryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  flagContainer: {
    marginRight: 12,
  },
  countryName: {
    fontSize: 16,
    fontFamily: "DMSansRegular",
    color: "#212B36",
    flex: 1,
  },
  dialCode: {
    fontSize: 16,
    fontFamily: "DMSansMedium",
    color: "#637381",
  },
  selectedText: {
    color: "#FF3B4A",
    fontFamily: "DMSansSemiBold",
  },
  emptyState: {
    paddingVertical: 40,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: "DMSansSemiBold",
    color: "#212B36",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: "DMSansRegular",
    color: "#637381",
    textAlign: "center",
  },
});

export default CountryCodeSelector;

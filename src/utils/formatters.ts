
// Function to format a string in camelcase (capitalize first letter of each word)
export function toCamelCase(str: string): string {
  if (!str) return str;
  
  return str
    .trim() // Remove leading and trailing spaces
    .split(' ')
    .map(word => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

// Function to calculate age in years from DOB
export function calculateAgeInYears(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Function to calculate age in months from DOB
export function calculateAgeInMonths(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  
  return (today.getFullYear() - birthDate.getFullYear()) * 12 
    + today.getMonth() - birthDate.getMonth();
}

// Function to get DOB from age in years
export function getDobFromYears(years: number): string {
  const today = new Date();
  const dob = new Date(today);
  dob.setFullYear(today.getFullYear() - years);
  return dob.toISOString().slice(0, 10);
}

// Function to get DOB from age in months
export function getDobFromMonths(months: number): string {
  const today = new Date();
  const dob = new Date(today);
  dob.setMonth(today.getMonth() - months);
  return dob.toISOString().slice(0, 10);
}

// Function to get MUAC status
export function getMuacStatus(muac: number): "SAM" | "MAM" | "Normal" {
  if (muac <= 11) return "SAM";
  if (muac <= 12) return "MAM";
  return "Normal";
}

// Function to format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Function to create a JSON file for export
export function createJsonExport(data: any) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = `export_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

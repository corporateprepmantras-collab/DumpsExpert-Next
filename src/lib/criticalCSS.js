// Critical CSS for above-the-fold content
// Inlined in <head> for instant render
export const criticalCSS = `
  /* Reset and base */
  *,::before,::after{box-sizing:border-box;border:0 solid #e5e7eb}
  html{line-height:1.5;-webkit-text-size-adjust:100%;tab-size:4;font-family:Inter,system-ui,sans-serif}
  body{margin:0;line-height:inherit}
  
  /* Typography - Above fold only */
  h1{font-size:2rem;font-weight:700;line-height:1.2;color:#111827;margin:0 0 1rem}
  p{margin:0 0 1rem;color:#4b5563}
  
  /* Layout utilities - Critical only */
  .flex{display:flex}
  .flex-col{flex-direction:column}
  .items-center{align-items:center}
  .justify-between{justify-content:space-between}
  .gap-8{gap:2rem}
  .w-full{width:100%}
  .max-w-7xl{max-width:80rem}
  .mx-auto{margin-left:auto;margin-right:auto}
  .px-4{padding-left:1rem;padding-right:1rem}
  .py-8{padding-top:2rem;padding-bottom:2rem}
  .pt-20{padding-top:5rem}
  
  /* Colors */
  .bg-white{background-color:#fff}
  .text-gray-600{color:#4b5563}
  .text-gray-900{color:#111827}
  
  /* Skeleton loader */
  .animate-pulse{animation:pulse 2s cubic-bezier(.4,0,.6,1) infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
  .bg-gray-200{background-color:#e5e7eb}
  .rounded-lg{border-radius:.5rem}
  
  /* Hidden */
  .hidden{display:none}
  
  @media(min-width:1024px){
    .lg\\:flex-row{flex-direction:row}
    .lg\\:w-1\\/2{width:50%}
    .lg\\:text-4xl{font-size:2.25rem;line-height:2.5rem}
  }
`;

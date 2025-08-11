// Set current year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 80,
        behavior: "smooth",
      });
    }
  });
});

// Contact form handling with multiple fallbacks
document
  .getElementById("contactForm")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();
    const form = e.target;
    const statusElement = document.getElementById("formStatus");

    // Get form data
    const formData = {
      name: form.elements["name"].value,
      email: form.elements["email"].value,
      subject: form.elements["subject"].value || "New message from portfolio",
      message: form.elements["message"].value,
    };

    // Show sending state
    statusElement.textContent = "Sending your message...";
    statusElement.style.color = "#000";
    statusElement.style.display = "block";

    try {
      // Try Formspree first
      const formspreeResponse = await tryFormspree(formData);

      if (formspreeResponse.ok) {
        statusElement.textContent =
          "Message sent successfully! I'll respond within 24 hours.";
        statusElement.style.color = "green";
        form.reset();
        return;
      }

      // If Formspree fails, try serverless function
      const serverlessResponse = await tryServerlessFunction(formData);

      if (serverlessResponse.ok) {
        statusElement.textContent = "Message sent successfully!";
        statusElement.style.color = "green";
        form.reset();
        return;
      }

      // If all else fails, use mailto fallback
      mailtoFallback(formData);
    } catch (error) {
      console.error("Form submission error:", error);
      mailtoFallback(formData);
    }
  });

async function tryFormspree(data) {
  // Replace with your actual Formspree ID
  const formspreeId = "mrbljgyr";
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });

  return await fetch(`https://formspree.io/f/${formspreeId}`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
    },
  });
}

async function tryServerlessFunction(data) {
  // Alternative using Netlify/Vercel function
  return await fetch("/.netlify/functions/send-email", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function mailtoFallback(data) {
  const subject = encodeURIComponent(data.subject);
  const body = encodeURIComponent(
    `Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`
  );

  const statusElement = document.getElementById("formStatus");
  statusElement.innerHTML = `
    There was a problem with the form. 
    <a href="mailto:srianushananduri2801@gmail.com?subject=${subject}&body=${body}" style="color: #4361ee; text-decoration: underline;">
      Click here to email me directly
    </a>
  `;
  statusElement.style.color = "#e63946";
}

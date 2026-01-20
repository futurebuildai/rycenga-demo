/**
 * Lumber Boss - Account Portal JavaScript
 * Handles navigation, tab switching, and interactive features
 */

document.addEventListener('DOMContentLoaded', function () {
    // ========================================
    // Global Elements & State
    // ========================================
    const sections = document.querySelectorAll('.account-section');
    const navItems = document.querySelectorAll('.account-nav-item');
    const sidebar = document.getElementById('account-sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    const appWrapper = document.getElementById('app-wrapper');
    const loginSection = document.getElementById('section-login');

    // ========================================
    // Authentication Logic
    // ========================================
    const DEMO_EMAIL = "HomeProUSA@demo.com";
    const DEMO_PASSWORD = "MyAccountLite2026";

    /**
     * Checks if the user is currently authenticated.
     */
    function checkAuth() {
        const session = localStorage.getItem('lumberboss_session');
        if (session) {
            showApp();
            return true;
        } else {
            showLogin();
            return false;
        }
    }

    /**
     * Displays the main application and hides login.
     */
    function showApp() {
        if (loginSection) loginSection.style.display = 'none';
        if (appWrapper) appWrapper.style.display = 'block';
        loadAccountData();
        handleRouting();
    }

    /**
     * Displays the login screen and hides the app.
     */
    function showLogin() {
        if (appWrapper) appWrapper.style.display = 'none';
        if (loginSection) loginSection.style.display = 'flex';
    }

    /**
     * Handles the login form submission.
     */
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const errorEl = document.getElementById('login-error');

            if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
                const sessionData = {
                    email: email,
                    loginTime: new Date().toISOString()
                };
                localStorage.setItem('lumberboss_session', JSON.stringify(sessionData));
                if (errorEl) errorEl.style.display = 'none';
                showApp();
            } else {
                if (errorEl) errorEl.style.display = 'block';
            }
        });
    }

    // Initialize Auth UI
    checkAuth();

    // ========================================
    // Load Account Data
    // ========================================
    /**
     * Fetches account data from mock JSON and updates the UI.
     */
    async function loadAccountData() {
        try {
            const response = await fetch('./data/account.json');
            if (!response.ok) throw new Error('Failed to load account data');
            const data = await response.json();

            // Update Greeting
            const greetingEl = document.getElementById('user-greeting');
            if (greetingEl) {
                greetingEl.textContent = `Welcome back, ${data.user.firstName}`;
            }

            // Update Sidebar User Info
            const sidebarNameEl = document.querySelector('.account-user-name');
            const sidebarCompanyEl = document.querySelector('.account-company');
            const sidebarAvatarEl = document.querySelector('.account-avatar');

            if (sidebarNameEl) sidebarNameEl.textContent = data.user.fullName;
            if (sidebarCompanyEl) sidebarCompanyEl.textContent = data.company.name;
            if (sidebarAvatarEl) sidebarAvatarEl.textContent = data.user.initials;

            // Update Sidebar Footer Support Info
            const supportPhoneEl = document.getElementById('support-phone');
            const supportEmailEl = document.getElementById('support-email');

            if (supportPhoneEl) {
                supportPhoneEl.textContent = data.support.phone;
                supportPhoneEl.href = `tel:${data.support.phone.replace(/\D/g, '')}`;
            }
            if (supportEmailEl) {
                supportEmailEl.textContent = data.support.email;
                supportEmailEl.href = `mailto:${data.support.email}`;
            }

            // Update Settings Profile Info
            const settingsNameEl = document.getElementById('settings-full-name');
            const settingsEmailEl = document.getElementById('settings-email');
            const settingsPhoneEl = document.getElementById('settings-phone');
            const settingsCompanyEl = document.getElementById('settings-company');

            if (settingsNameEl) settingsNameEl.value = data.user.fullName;
            if (settingsEmailEl) settingsEmailEl.value = data.user.email;
            if (settingsPhoneEl) settingsPhoneEl.value = data.user.phone;
            if (settingsCompanyEl) settingsCompanyEl.value = data.company.name;

            // Update Team List
            const teamListEl = document.getElementById('team-list');
            if (teamListEl && data.team) {
                teamListEl.innerHTML = data.team.map(member => `
                    <div class="team-member">
                        <div class="member-avatar">${member.initials}</div>
                        <div class="member-info">
                            <span class="member-name">${member.name}</span>
                            <span class="member-email">${member.email}</span>
                        </div>
                        <span class="member-role">${member.role}</span>
                    </div>
                `).join('');
            }

            // Update Header Right Info (Initial for now)
            const currentLocationEl = document.querySelector('.current-location');
            if (currentLocationEl && data.location) {
                currentLocationEl.textContent = data.location;
            }

            console.log('Account data loaded successfully');
        } catch (error) {
            console.error('Error loading account data:', error);
        }
    }

    // loadAccountData is now called within showApp() if auth is successful.
    // loadAccountData();

    // ========================================
    // Section Navigation (Hash-based Routing)
    // ========================================
    /**
     * Switches the portal section based on ID.
     * @param {string} sectionId - The ID of the section to display (e.g., 'overview').
     */
    function showSection(sectionId) {

        // Hide all sections
        sections.forEach(section => section.classList.remove('active'));

        // Remove active from all nav items
        navItems.forEach(item => item.classList.remove('active'));

        // Show target section
        const targetSection = document.getElementById(`section-${sectionId}`);
        if (targetSection) {
            targetSection.classList.add('active');
        } else {
            // Default to overview if section not found
            document.getElementById('section-overview')?.classList.add('active');
            sectionId = 'overview';
        }

        // Set active nav item
        const activeNavItem = document.querySelector(`.account-nav-item[data-section="${sectionId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Sync URL (without pushing to history if already there)
        if (window.location.hash !== `#${sectionId}`) {
            history.pushState(null, null, `#${sectionId}`);
        }
    }

    /**
     * Handles routing based on the current window location hash.
     */
    function handleRouting() {
        if (!localStorage.getItem('lumberboss_session')) {
            showLogin();
            return;
        }
        const hash = window.location.hash.substring(1) || 'overview';
        showSection(hash);
    }

    // Global click listener for navigation (Event Delegation)
    document.addEventListener('click', function (e) {
        const navLink = e.target.closest('[data-section]');
        if (navLink) {
            e.preventDefault();
            const sectionId = navLink.dataset.section;
            window.location.hash = sectionId;
        }
    });

    // Handle hash changes (back/forward and direct links)
    window.addEventListener('hashchange', handleRouting);

    // Initial route
    handleRouting();

    // ========================================
    // Billing Tabs
    // ========================================
    const billingTabs = document.querySelectorAll('.billing-tab');
    const billingContents = document.querySelectorAll('.billing-content');

    billingTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const tabId = this.dataset.tab;

            // Remove active from all tabs
            billingTabs.forEach(t => t.classList.remove('active'));
            billingContents.forEach(c => c.classList.remove('active'));

            // Activate clicked tab
            this.classList.add('active');
            document.getElementById(`billing-${tabId}`).classList.add('active');
        });
    });

    // ========================================
    // Filter Chips
    // ========================================
    document.querySelectorAll('.filter-chips').forEach(chipGroup => {
        const chips = chipGroup.querySelectorAll('.filter-chip');
        chips.forEach(chip => {
            chip.addEventListener('click', function () {
                chips.forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                // In a real app, this would trigger a filter action
                console.log(`Filter: ${this.textContent.trim()}`);
            });
        });
    });

    // ========================================
    // Header Components
    // ========================================
    // ========================================
    // Header Components - Location Dropdown
    // ========================================
    const locationSelectorTrigger = document.querySelector('.location-selector-trigger');
    const locationDropdown = document.getElementById('location-dropdown');

    if (locationSelectorTrigger && locationDropdown) {
        // Toggle dropdown
        locationSelectorTrigger.addEventListener('click', function (e) {
            e.stopPropagation();
            locationDropdown.classList.toggle('active');
        });

        // Handle selection
        const locationOptions = locationDropdown.querySelectorAll('.location-option');
        locationOptions.forEach(option => {
            option.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                const selectedLocation = this.dataset.value;
                const currentLocationEl = document.querySelector('.current-location');

                if (currentLocationEl) {
                    currentLocationEl.textContent = selectedLocation;
                }

                locationDropdown.classList.remove('active');

                if (window.showToast) {
                    window.showToast(`Switched to ${selectedLocation} branch`, 'success');
                }
            });
        });

        // Close when clicking outside
        document.addEventListener('click', function (e) {
            if (!locationDropdown.contains(e.target) && !locationSelectorTrigger.contains(e.target)) {
                locationDropdown.classList.remove('active');
            }
        });
    }

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            sidebar.classList.toggle('open');
            console.log('Sidebar toggled');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function (e) {
            if (sidebar.classList.contains('open') &&
                !sidebar.contains(e.target) &&
                !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });

        // Close sidebar on nav item click (for mobile experience)
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth < 1024) {
                    sidebar.classList.remove('open');
                }
            });
        });
    }

    // ========================================
    // Invoice Selection
    // ========================================
    const invoiceCheckboxes = document.querySelectorAll('.invoice-checkbox');
    const selectedCount = document.querySelector('.selected-count');
    const paySelectedBtn = document.querySelector('.bulk-actions .btn-primary');

    /**
     * Updates the UI state for bulk invoice selection.
     */
    function updateInvoiceSelection() {
        const checked = document.querySelectorAll('.invoice-checkbox:checked');
        const count = checked.length;

        if (selectedCount) {
            selectedCount.textContent = `${count} selected`;
        }

        if (paySelectedBtn) {
            paySelectedBtn.disabled = count === 0;

            // Calculate total
            let total = 0;
            checked.forEach(checkbox => {
                const row = checkbox.closest('.invoice-row');
                const amountText = row.querySelector('.invoice-amount').textContent;
                total += parseFloat(amountText.replace(/[$,]/g, ''));
            });

            if (count > 0) {
                paySelectedBtn.textContent = `Pay Selected ($${total.toLocaleString('en-US', { minimumFractionDigits: 2 })})`;
            } else {
                paySelectedBtn.textContent = 'Pay Selected';
            }
        }
    }

    invoiceCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateInvoiceSelection);
    });

    // ========================================
    // Quick Actions
    // ========================================
    document.querySelectorAll('.quick-action').forEach(action => {
        action.addEventListener('click', function () {
            const actionText = this.textContent.trim();

            switch (actionText) {
                case 'Pay Balance':
                    alert('Payment modal would open here.\n\nBalance Due: $15,300.00');
                    break;
                case 'Request Estimate':
                    alert('Estimate request form would open here.');
                    break;
                case 'Reorder Last':
                    if (window.showToast) {
                        window.showToast('Last order items added to cart', 'success');
                    } else {
                        alert('Last order items added to cart!');
                    }
                    break;
                case 'Get Support':
                    window.location.href = 'tel:5551234567';
                    break;
            }
        });
    });

    // ========================================
    // Pay Now Button
    // ========================================
    const payBalanceBtn = document.getElementById('pay-balance-btn');
    if (payBalanceBtn) {
        payBalanceBtn.addEventListener('click', function () {
            alert('Payment modal would open here.\n\nTotal Balance Due: $15,300.00\n\nPayment methods:\n• Visa ending in 2689 (default)\n• Add new card\n• ACH bank transfer');
        });
    }

    // Individual invoice pay buttons
    document.querySelectorAll('.invoice-row .btn-cta').forEach(btn => {
        btn.addEventListener('click', function () {
            const row = this.closest('.invoice-row');
            const invoiceNum = row.querySelector('.invoice-number').textContent;
            const amount = row.querySelector('.invoice-amount').textContent;
            alert(`Pay Invoice ${invoiceNum}\n\nAmount: ${amount}\n\nPayment would be processed here.`);
        });
    });

    // ========================================
    // Estimate Actions
    // ========================================
    // ========================================
    // Estimate Actions & Drill Down
    // ========================================
    const estimatesList = document.getElementById('estimates-view-list');
    const estimatesDetail = document.getElementById('estimates-view-detail');

    // "View Details" button handler
    document.querySelectorAll('.btn-view-estimate').forEach(btn => {
        btn.addEventListener('click', function () {
            const estimateId = this.dataset.id;

            // In a real app, populate data via API. Here we just swap views.
            console.log(`Viewing details for ${estimateId}`);

            // Mock: Update Detail View Title
            const detailIdEl = document.querySelector('.detail-id');
            if (detailIdEl) detailIdEl.textContent = estimateId;

            // Swap views
            if (estimatesList && estimatesDetail) {
                estimatesList.style.display = 'none';
                estimatesDetail.style.display = 'block';
                // Scroll to top of section
                document.getElementById('section-estimates').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // "Back to List" button handler
    document.querySelector('.btn-back-estimates')?.addEventListener('click', function () {
        if (estimatesList && estimatesDetail) {
            estimatesDetail.style.display = 'none';
            estimatesList.style.display = 'block';
        }
    });

    // ========================================
    // Orders Actions & Drill Down
    // ========================================
    const ordersList = document.getElementById('orders-view-list');
    const ordersDetail = document.getElementById('orders-view-detail');

    // Mock Data for Orders
    const ordersData = {
        'ORD-478242': {
            id: 'ORD-478242',
            project: 'My Framing Job',
            address: '1234 Construction Ave',
            projectColor: '#3b82f6',
            status: 'Delivered',
            statusClass: 'status-delivered',
            date: 'Mon, Dec 20, 2024',
            items: [
                { name: '2" x 4" x 14\' SPF', sku: '100-2414', qty: 100, price: 9.20 },
                { name: 'Gold Star Screw 1-5/8" 5#', sku: 'H-GS-5', qty: 5, price: 45.00 },
                { name: 'DeWalt 20V Max Drill Kit', sku: 'T-DW-20V', qty: 1, price: 99.00 }
            ],
            taxRate: 0.0825
        },
        'ORD-476918': {
            id: 'ORD-476918',
            project: '50 Main Street',
            address: '50 Main Street',
            projectColor: '#22c55e',
            status: 'Fulfilled',
            statusClass: 'status-fulfilled',
            date: 'Wed, Dec 18, 2024',
            items: [
                { name: '2" x 4" Treated Wood', sku: '100-2408-T', qty: 50, price: 8.50 },
                { name: 'I-Joist, RFPI 80S 11-7/8" x 10\'', sku: 'L-IJ-1178', qty: 20, price: 45.20 },
                { name: 'Special Order Item', sku: 'SO-999', qty: 1, price: 510.56, isSpecial: true }
            ],
            taxRate: 0.0825
        },
        'ORD-476909': {
            id: 'ORD-476909',
            project: 'Erik\'s Shed',
            address: '789 Backyard Lane',
            projectColor: '#f97316',
            status: 'Out for Delivery',
            statusClass: 'status-out-for-delivery',
            date: 'Sun, Dec 15, 2024',
            items: [
                { name: '2" x 4" x 10\' SPF', sku: '100-2410', qty: 20, price: 6.50 },
                { name: 'Sheetrock Ultralight Drywall Compound', sku: 'DG-Mud-5', qty: 4, price: 18.25 },
                { name: 'Joint Tape 250\'', sku: 'DG-Tape', qty: 2, price: 3.49 },
                { name: 'Sanding Sponge', sku: 'T-Sand-M', qty: 5, price: 2.99 }
            ],
            taxRate: 0.0825
        }
    };

    // "View Details" button handler for Orders
    document.querySelectorAll('.btn-view-order').forEach(btn => {
        btn.addEventListener('click', function () {
            const orderId = this.dataset.id;
            console.log(`Viewing details for ${orderId}`);

            const order = ordersData[orderId];

            if (order) {
                // Populate Detail View
                const detailIdEl = document.querySelector('.detail-order-id');
                const detailProjectEl = document.querySelector('.detail-project-info');
                const detailStatusEl = document.querySelector('.detail-status');
                const itemsBody = document.querySelector('.detail-line-items-body');
                const totalsFoot = document.querySelector('.detail-totals-foot');

                if (detailIdEl) detailIdEl.textContent = order.id;
                if (detailProjectEl) detailProjectEl.textContent = `${order.project} • ${order.address}`;

                if (detailStatusEl) {
                    detailStatusEl.textContent = order.status;
                    detailStatusEl.className = `status-badge detail-status ${order.statusClass}`;
                }

                // Calculate Totals
                let subtotal = 0;

                // Build Items HTML
                if (itemsBody) {
                    itemsBody.innerHTML = order.items.map(item => {
                        const itemTotal = item.qty * item.price;
                        subtotal += itemTotal;
                        return `
                            <tr>
                                <td>
                                    <div class="line-item-name">${item.name}</div>
                                    <div class="line-item-sku">SKU: ${item.sku}</div>
                                </td>
                                <td class="text-right">${item.qty}</td>
                                <td class="text-right">$${item.price.toFixed(2)}</td>
                                <td class="text-right">$${itemTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                        `;
                    }).join('');
                }

                const tax = subtotal * order.taxRate;
                const total = subtotal + tax;

                // Build Totals HTML
                if (totalsFoot) {
                    totalsFoot.innerHTML = `
                         <tr>
                            <td colspan="3" class="text-right"><strong>Subtotal</strong></td>
                            <td class="text-right">$${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                            <td colspan="3" class="text-right">Tax (8.25%)</td>
                            <td class="text-right">$${tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                        <tr class="grand-total-row">
                            <td colspan="3" class="text-right"><strong>Total</strong></td>
                            <td class="text-right"><strong>$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                        </tr>
                    `;
                }

                // Swap views
                if (ordersList && ordersDetail) {
                    ordersList.style.display = 'none';
                    ordersDetail.style.display = 'block';
                    // Scroll to top of section
                    document.getElementById('section-orders').scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                console.error('Order data not found for:', orderId);
            }
        });
    });

    // "Back to List" button handler for Orders
    document.querySelector('.btn-back-orders')?.addEventListener('click', function () {
        if (ordersList && ordersDetail) {
            ordersDetail.style.display = 'none';
            ordersList.style.display = 'block';
        }
    });

    // ========================================
    // Invoices Actions & Drill Down
    // ========================================
    const invoicesViewList = document.getElementById('billing-invoices-list');
    const invoicesViewDetail = document.getElementById('billing-invoices-detail');

    // Mock Data for Invoices
    const invoicesData = {
        'INV-336318': {
            id: 'INV-336318',
            project: 'PO# 3128 TC ORD# 336318',
            status: 'Open',
            statusClass: 'status-open',
            date: 'Aug 29, 2023',
            items: [
                { name: '2" x 4" x 14\' SPF', qty: 1575, price: 9.2051 },
                { name: 'Gold Star Screw 1-5/8" 5#', qty: 10, price: 45.00 },
                { name: 'Building Permit Fee', qty: 1, price: 250.00 }
            ],
            taxRate: 0.0825
        },
        'INV-W71083': {
            id: 'INV-W71083',
            project: 'PO# JOB NUMBER',
            status: 'Open',
            statusClass: 'status-open',
            date: 'Aug 28, 2023',
            items: [
                { name: 'Sanding Sponge Medium', qty: 5, price: 2.99 },
                { name: 'Joint Tape 250\'', qty: 2, price: 3.49 }
            ],
            taxRate: 0.0825
        },
        'INV-335252': {
            id: 'INV-335252',
            project: 'PO# 1533 OAKMONT',
            status: 'Open',
            statusClass: 'status-open',
            date: 'Aug 28, 2023',
            items: [
                { name: 'Sheetrock Ultralight Drywall Compound', qty: 10, price: 18.25 },
                { name: 'Drywall Screws 1-1/4" 25lb', qty: 2, price: 65.00 }
            ],
            taxRate: 0.0825
        }
    };

    // "View Details" button handler for Invoices
    document.querySelectorAll('.btn-view-invoice').forEach(btn => {
        btn.addEventListener('click', function () {
            const invoiceId = this.dataset.id;
            const invoice = invoicesData[invoiceId];

            if (invoice) {
                // Populate Detail View
                const detailIdEl = document.querySelector('.detail-invoice-id');
                const detailProjectEl = document.querySelector('.detail-invoice-id + p');
                const detailStatusEl = document.querySelector('#billing-invoices-detail .detail-status');
                const itemsBody = document.querySelector('.detail-invoice-items-body');
                const totalsFoot = document.querySelector('.detail-invoice-totals-foot');

                if (detailIdEl) detailIdEl.textContent = invoice.id;
                if (detailProjectEl) detailProjectEl.textContent = invoice.project;

                if (detailStatusEl) {
                    detailStatusEl.textContent = invoice.status;
                    detailStatusEl.className = `status-badge detail-status ${invoice.statusClass}`;
                }

                // Calculate Totals
                let subtotal = 0;

                // Build Items HTML
                if (itemsBody) {
                    itemsBody.innerHTML = invoice.items.map(item => {
                        const itemTotal = item.qty * item.price;
                        subtotal += itemTotal;
                        return `
                            <tr>
                                <td>
                                    <div class="line-item-name">${item.name}</div>
                                </td>
                                <td class="text-right">${item.qty}</td>
                                <td class="text-right">$${item.price.toFixed(2)}</td>
                                <td class="text-right">$${itemTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                        `;
                    }).join('');
                }

                const tax = subtotal * invoice.taxRate;
                const total = subtotal + tax;

                // Build Totals HTML
                if (totalsFoot) {
                    totalsFoot.innerHTML = `
                         <tr>
                            <td colspan="3" class="text-right"><strong>Subtotal</strong></td>
                            <td class="text-right">$${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                            <td colspan="3" class="text-right">Tax (8.25%)</td>
                            <td class="text-right">$${tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                        <tr class="grand-total-row">
                            <td colspan="3" class="text-right"><strong>Total</strong></td>
                            <td class="text-right"><strong>$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                        </tr>
                    `;
                }

                // Swap views
                if (invoicesViewList && invoicesViewDetail) {
                    invoicesViewList.style.display = 'none';
                    invoicesViewDetail.style.display = 'block';
                    // Scroll to top of section
                    document.getElementById('section-billing').scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // "Back to Invoices" button handler
    document.querySelector('.btn-back-billing')?.addEventListener('click', function () {
        if (invoicesViewList && invoicesViewDetail) {
            invoicesViewDetail.style.display = 'none';
            invoicesViewList.style.display = 'block';
        }
    });

    // Individual "Pay Invoice" in detail view
    document.querySelector('.btn-pay-invoice-detail')?.addEventListener('click', function () {
        const invoiceId = document.querySelector('.detail-invoice-id').textContent;
        alert(`Initiating payment for ${invoiceId}.\n\nDirected to secure checkout drawer...`);
    });

    // ========================================
    // Project Card Actions & Deep Linking
    // ========================================
    document.querySelectorAll('.project-card-actions .btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const sectionId = this.dataset.section;
            const projectId = this.dataset.project;
            const projectName = this.closest('.project-card').querySelector('h3').textContent;

            // Navigate to section
            showSection(sectionId);

            // Mock: Apply deep-link filter
            if (window.showToast) {
                window.showToast(`Showing ${sectionId} for project: ${projectName}`, 'info');
            }
            console.log(`Deep-linked to ${sectionId} for Project ID: ${projectId} (${projectName})`);

            // In a real app, this would trigger:
            // filterOrdersByProject(projectId);
        });
    });

    // ========================================
    // Projects Page Filtering (Mock)
    // ========================================
    const projectSearch = document.querySelector('#section-projects .filter-search');
    const projectCards = document.querySelectorAll('.project-card');

    if (projectSearch) {
        projectSearch.addEventListener('input', function () {
            const query = this.value.toLowerCase();
            projectCards.forEach(card => {
                const name = card.querySelector('h3').textContent.toLowerCase();
                const address = card.querySelector('p').textContent.toLowerCase();
                if (name.includes(query) || address.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // ========================================
    // Toast notification system
    // ========================================
    window.showToast = function (message, type = 'info') {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
      <div class="toast-content">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>${message}</span>
      </div>
    `;

        document.body.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('toast-visible');
        });

        // Auto-remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('toast-visible');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    // Mobile Sidebar logic consolidated at top

    // ========================================
    // Sign Out
    // ========================================
    const signOutBtn = document.querySelector('.sign-out-btn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', function () {
            if (confirm('Are you sure you want to sign out?')) {
                localStorage.removeItem('lumberboss_session');
                window.location.hash = ''; // Reset hash back to default
                showLogin();
            }
        });
    }

    // ========================================
    // Settings: Save Profile
    // ========================================
    const saveProfileBtn = document.querySelector('.btn-save-profile');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', function () {
            // Mock API call
            const btn = this;
            const originalText = btn.textContent;

            btn.textContent = 'Saving...';
            btn.disabled = true;

            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
                if (window.showToast) {
                    window.showToast('Profile updated successfully', 'success');
                } else {
                    alert('Profile updated successfully');
                }
            }, 800);
        });
    }
});

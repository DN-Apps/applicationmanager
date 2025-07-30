import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CarouselMenu.css';

// Menüpunkte mit Pfaden
const menuItems = [
    { id: 1, title: 'Applikationen', path: '/applications' },
    { id: 2, title: 'User', path: '/users' },
    { id: 3, title: 'Maintenance', path: '/maintenance' },
    { id: 4, title: 'Site-properties', path: '/site-properties' }
];

const CarouselMenu = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const navigate = useNavigate();

    // Navigation mit Pfeilen
    const handlePrev = () => {
        setActiveIndex(prev => (prev === 0 ? menuItems.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setActiveIndex(prev => (prev === menuItems.length - 1 ? 0 : prev + 1));
    };

    // Klick auf Menüpunkt
    const handleItemClick = (path, index) => {
        setActiveIndex(index);
        navigate(path);
    };

    // Tastatursteuerung
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'Enter') handleItemClick(menuItems[activeIndex].path, activeIndex);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeIndex]);

    return (
        <div className="carousel-container">
            {/* Linker Pfeil */}
            <button
                className="nav-arrow left-arrow"
                onClick={handlePrev}
                aria-label="Vorheriges Menü"
            >
                &larr;
            </button>

            {/* Karussell-Items */}
            <div className="carousel-track">
                {menuItems.map((item, index) => {
                    const position = (index - activeIndex + menuItems.length) % menuItems.length;
                    return (
                        <div
                            key={item.id}
                            className={`carousel-item ${position === 0 ? 'active' : ''}`}
                            style={{
                                '--pos': position,
                                '--total-items': menuItems.length
                            }}
                            onClick={() => handleItemClick(item.path, index)}
                            role="button"
                            tabIndex={0}
                        >
                            <div className="item-box">
                                {item.title}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Rechter Pfeil */}
            <button
                className="nav-arrow right-arrow"
                onClick={handleNext}
                aria-label="Nächstes Menü"
            >
                &rarr;
            </button>
        </div>
    );
};

export default CarouselMenu;
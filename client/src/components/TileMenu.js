import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TileMenu.css';

const tileItems = [
    { title: 'Applikationen', path: '/applications' },
    { title: 'User', path: '/users' },
    { title: 'Maintenance', path: '/maintenance' },
    { title: 'Site-properties', path: '/site-properties' }
];

const TileMenu = () => {
    const navigate = useNavigate();

    return (
        <div className="tile-grid">
            {tileItems.map((item, index) => (
                <div
                    key={index}
                    className="tile"
                    onClick={() => navigate(item.path)}
                    role="button"
                    tabIndex={0}
                >
                    {item.title}
                </div>
            ))}
        </div>
    );
};

export default TileMenu;

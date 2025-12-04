import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { Guest } from '../types/guest';

export interface ExportOptions {
  includeQRCodes: boolean;
  onlyPresent: boolean;
  groupByTable: boolean;
  includeCompanions: boolean;
}

class PDFExportService {
  async exportGuestList(
    guests: Guest[], 
    options: ExportOptions = {
      includeQRCodes: false,
      onlyPresent: false,
      groupByTable: true,
      includeCompanions: true
    }
  ): Promise<string> {
    
    // Filter guests based on options
    let filteredGuests = options.onlyPresent 
      ? guests.filter(g => g.isPresent)
      : guests;

    // Group by table if requested
    const guestsByTable = options.groupByTable 
      ? this.groupGuestsByTable(filteredGuests)
      : { 'Tous': filteredGuests };

    // Generate HTML content
    const htmlContent = this.generateHTML(guestsByTable, options);

    // Create PDF
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    return uri;
  }

  private groupGuestsByTable(guests: Guest[]): Record<string, Guest[]> {
    return guests.reduce((acc, guest) => {
      const table = guest.tableName || 'Sans table';
      if (!acc[table]) {
        acc[table] = [];
      }
      acc[table].push(guest);
      return acc;
    }, {} as Record<string, Guest[]>);
  }

  private generateHTML(guestsByTable: Record<string, Guest[]>, options: ExportOptions): string {
    const totalGuests = Object.values(guestsByTable).flat().length;
    const totalPresent = Object.values(guestsByTable).flat().filter(g => g.isPresent).length;
    const totalCompanions = Object.values(guestsByTable).flat()
      .reduce((sum, g) => sum + (g.isPresent ? g.companions : 0), 0);

    const title = options.onlyPresent ? 'Liste des Invités Présents' : 'Liste Complète des Invités';
    const date = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 20px;
          color: #333;
          line-height: 1.4;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #007AFF;
          padding-bottom: 20px;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          color: #007AFF;
          margin: 0;
        }
        .subtitle {
          font-size: 16px;
          color: #666;
          margin: 5px 0;
        }
        .stats {
          background: #F2F2F7;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
        }
        .stats-grid {
          display: flex;
          justify-content: space-around;
          flex-wrap: wrap;
        }
        .stat-item {
          margin: 5px;
        }
        .stat-number {
          font-size: 20px;
          font-weight: bold;
          color: #007AFF;
        }
        .stat-label {
          font-size: 12px;
          color: #666;
        }
        .table-section {
          margin: 25px 0;
          break-inside: avoid;
        }
        .table-header {
          background: #007AFF;
          color: white;
          padding: 10px 15px;
          border-radius: 6px 6px 0 0;
          font-weight: bold;
          font-size: 16px;
        }
        .guest-list {
          border: 1px solid #E5E5EA;
          border-top: none;
          border-radius: 0 0 6px 6px;
        }
        .guest-item {
          padding: 12px 15px;
          border-bottom: 1px solid #F2F2F7;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .guest-item:last-child {
          border-bottom: none;
        }
        .guest-info {
          flex: 1;
        }
        .guest-name {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 2px;
        }
        .guest-details {
          font-size: 12px;
          color: #666;
        }
        .guest-status {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }
        .status-present {
          background: #34C759;
          color: white;
        }
        .status-absent {
          background: #FF3B30;
          color: white;
        }
        .qr-placeholder {
          width: 40px;
          height: 40px;
          background: #F2F2F7;
          border: 1px dashed #C6C6C8;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: #666;
          margin-left: 10px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #999;
          border-top: 1px solid #E5E5EA;
          padding-top: 20px;
        }
        @media print {
          body { margin: 15px; }
          .table-section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="title">💍 ${title}</h1>
        <p class="subtitle">Mariage de Papa & Maman</p>
        <p class="subtitle">${date}</p>
      </div>

      <div class="stats">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">${totalGuests}</div>
            <div class="stat-label">Invités ${options.onlyPresent ? 'présents' : 'total'}</div>
          </div>
          ${!options.onlyPresent ? `
          <div class="stat-item">
            <div class="stat-number">${totalPresent}</div>
            <div class="stat-label">Présents</div>
          </div>
          ` : ''}
          ${options.includeCompanions ? `
          <div class="stat-item">
            <div class="stat-number">${totalCompanions}</div>
            <div class="stat-label">Accompagnants</div>
          </div>
          ` : ''}
        </div>
      </div>

      ${Object.entries(guestsByTable).map(([tableName, tableGuests]) => `
        <div class="table-section">
          <div class="table-header">
            ${options.groupByTable ? `📍 ${tableName}` : '👥 Tous les invités'} 
            (${tableGuests.length} ${tableGuests.length > 1 ? 'invités' : 'invité'})
          </div>
          <div class="guest-list">
            ${tableGuests.map(guest => `
              <div class="guest-item">
                <div class="guest-info">
                  <div class="guest-name">${guest.fullName}</div>
                  <div class="guest-details">
                    ${options.groupByTable ? '' : `Table ${guest.tableName} • `}
                    ${options.includeCompanions ? `${guest.companions} accompagnant${guest.companions !== 1 ? 's' : ''}` : ''}
                  </div>
                </div>
                <div class="guest-status ${guest.isPresent ? 'status-present' : 'status-absent'}">
                  ${guest.isPresent ? '✅ Présent' : '⏳ Absent'}
                </div>
                ${options.includeQRCodes ? '<div class="qr-placeholder">QR</div>' : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}

      <div class="footer">
        <p>Document généré le ${new Date().toLocaleString('fr-FR')}</p>
        <p>Application de gestion de mariage • Version 1.0</p>
      </div>
    </body>
    </html>
    `;
  }

  async shareExportedPDF(uri: string, filename: string = 'liste-invites.pdf') {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Partager la liste des invités',
        UTI: 'com.adobe.pdf'
      });
    } else {
      throw new Error('Partage non disponible sur cet appareil');
    }
  }

  async saveToDevice(uri: string, filename: string = 'liste-invites.pdf') {
    const sourceFile = new File(uri);
    const destinationFile = new File(Paths.document, filename);
    
    sourceFile.copy(destinationFile);
    
    return destinationFile.uri;
  }
}

export const pdfExportService = new PDFExportService();
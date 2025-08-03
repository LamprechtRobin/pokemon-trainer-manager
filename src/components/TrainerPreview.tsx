import React from 'react';
import {
  EnrichedTrainerData,
  ValidationStatus,
  ValidationIssue
} from '../types/aiTrainer';

interface TrainerPreviewProps {
  trainer: EnrichedTrainerData;
  onEdit?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  className?: string;
}

const TrainerPreview: React.FC<TrainerPreviewProps> = ({
  trainer,
  onEdit,
  onAccept,
  onReject,
  className = ''
}) => {
  const getStatusColor = (status: ValidationStatus): string => {
    switch (status) {
      case 'valid':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: ValidationStatus): string => {
    switch (status) {
      case 'valid':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✗';
      default:
        return '?';
    }
  };

  const groupIssuesBySeverity = (issues: ValidationIssue[]) => {
    return {
      errors: issues.filter(i => i.severity === 'error'),
      warnings: issues.filter(i => i.severity === 'warning'),
      info: issues.filter(i => i.severity === 'info')
    };
  };

  const { errors, warnings, info } = groupIssuesBySeverity(trainer.validationSummary.issues);

  return (
    <div className={`bg-white border border-gray-300 rounded-xl p-6 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {trainer.name}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {trainer.description}
          </p>
        </div>
        
        {/* Validation Status Badge */}
        <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(trainer.validationSummary.overall)}`}>
          <span className="mr-1">{getStatusIcon(trainer.validationSummary.overall)}</span>
          {trainer.validationSummary.overall === 'valid' && 'Gültig'}
          {trainer.validationSummary.overall === 'warning' && 'Warnungen'}
          {trainer.validationSummary.overall === 'error' && 'Fehler'}
        </div>
      </div>

      {/* Pokemon Team */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">
          Pokemon-Team ({trainer.team.length} Pokemon)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainer.team.map((pokemon, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${getStatusColor(pokemon.validationStatus)} border-opacity-50`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h5 className="font-medium text-gray-900 capitalize">
                    {pokemon.name}
                  </h5>
                  <p className="text-sm text-gray-600">
                    Level {pokemon.level || 1}
                  </p>
                </div>
                
                <div className="flex flex-col items-end space-y-1">
                  {pokemon.isShiny && (
                    <div className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                      ✨ Shiny
                    </div>
                  )}
                  <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(pokemon.validationStatus)}`}>
                    {getStatusIcon(pokemon.validationStatus)}
                  </div>
                </div>
              </div>

              {/* Pokemon Stats */}
              {pokemon.stats && (
                <div className="mt-3">
                  <h6 className="text-xs font-medium text-gray-700 mb-2">Basis-Stats</h6>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">HP:</span>
                      <span className="font-medium">{pokemon.stats.hp || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ATK:</span>
                      <span className="font-medium">{pokemon.stats.attack || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">DEF:</span>
                      <span className="font-medium">{pokemon.stats.defense || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">SPD:</span>
                      <span className="font-medium">{pokemon.stats.speed || 0}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Talent Points */}
              {pokemon.talentPoints && (
                <div className="mt-3">
                  <h6 className="text-xs font-medium text-gray-700 mb-2">Talent-Punkte</h6>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">HP:</span>
                      <span className="font-medium text-primary-600">+{pokemon.talentPoints.hp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ATK:</span>
                      <span className="font-medium text-primary-600">+{pokemon.talentPoints.attack}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">DEF:</span>
                      <span className="font-medium text-primary-600">+{pokemon.talentPoints.defense}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">SPD:</span>
                      <span className="font-medium text-primary-600">+{pokemon.talentPoints.speed}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Generation Settings Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Generierungs-Einstellungen
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Regionen:</span>
            <p className="font-medium capitalize">
              {trainer.generationSettings.regions.includes('all') 
                ? 'Alle Regionen' 
                : trainer.generationSettings.regions.length === 1
                  ? trainer.generationSettings.regions[0]
                  : `${trainer.generationSettings.regions.length} Regionen`
              }
            </p>
          </div>
          <div>
            <span className="text-gray-600">Typ:</span>
            <p className="font-medium capitalize">
              {trainer.generationSettings.preferredType === 'all' 
                ? 'Alle' 
                : trainer.generationSettings.preferredType
              }
            </p>
          </div>
          <div>
            <span className="text-gray-600">Persönlichkeit:</span>
            <p className="font-medium capitalize">{trainer.generationSettings.trainerPersonality}</p>
          </div>
        </div>
      </div>

      {/* Validation Issues */}
      {(errors.length > 0 || warnings.length > 0 || info.length > 0) && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Validierungs-Hinweise
          </h4>
          
          {/* Errors */}
          {errors.length > 0 && (
            <div className="mb-3">
              <h5 className="text-sm font-medium text-red-700 mb-2">
                ❌ Fehler ({errors.length})
              </h5>
              <ul className="space-y-1">
                {errors.map((issue, index) => (
                  <li key={index} className="text-sm text-red-600 bg-red-50 rounded-lg p-2">
                    {issue.message}
                    {issue.suggestion && (
                      <span className="block text-red-500 text-xs mt-1">
                        💡 {issue.suggestion}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="mb-3">
              <h5 className="text-sm font-medium text-yellow-700 mb-2">
                ⚠️ Warnungen ({warnings.length})
              </h5>
              <ul className="space-y-1">
                {warnings.map((issue, index) => (
                  <li key={index} className="text-sm text-yellow-600 bg-yellow-50 rounded-lg p-2">
                    {issue.message}
                    {issue.suggestion && (
                      <span className="block text-yellow-500 text-xs mt-1">
                        💡 {issue.suggestion}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Info */}
          {info.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-blue-700 mb-2">
                ℹ️ Hinweise ({info.length})
              </h5>
              <ul className="space-y-1">
                {info.map((issue, index) => (
                  <li key={index} className="text-sm text-blue-600 bg-blue-50 rounded-lg p-2">
                    {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Auto-Corrections */}
      {trainer.validationSummary.autoCorrections.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            🔧 Automatische Korrekturen
          </h4>
          <ul className="space-y-1">
            {trainer.validationSummary.autoCorrections.map((correction, index) => (
              <li key={index} className="text-sm text-green-600 bg-green-50 rounded-lg p-2">
                {correction}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
        {onAccept && (
          <button
            type="button"
            onClick={onAccept}
            disabled={trainer.validationSummary.overall === 'error'}
            className={`flex-1 px-6 py-3 font-medium rounded-lg transition-colors ${
              trainer.validationSummary.overall === 'error'
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-success-500 text-white hover:bg-success-600'
            }`}
          >
            {trainer.validationSummary.overall === 'error' 
              ? 'Fehlerhaft - Kann nicht übernommen werden'
              : 'Trainer übernehmen'
            }
          </button>
        )}
        
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="px-6 py-3 font-medium text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
          >
            Bearbeiten
          </button>
        )}
        
        {onReject && (
          <button
            type="button"
            onClick={onReject}
            className="px-6 py-3 font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Verwerfen
          </button>
        )}
      </div>
    </div>
  );
};

export default TrainerPreview;